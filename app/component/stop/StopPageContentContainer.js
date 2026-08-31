import React, { useEffect } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import { matchShape } from 'found';
import { errorShape, relayShape, stopShape } from '../../util/shapes';
import DepartureListContainer from '../DepartureListContainer';
import ScrollableWrapper from '../ScrollableWrapper';
import { getPrimaryStopMode } from '../../util/modeUtils';
import { getModeIconColor } from '../../util/colorUtils';
import StopServiceStatusBanner from './StopServiceStatusBanner';
import { useConfigContext } from '../../configurations/ConfigContext';
import { useCurrentTime } from '../../hooks/TimeContext';

function StopPageContent({ stop, relay, error, match }) {
  const intl = useIntl();
  const config = useConfigContext();
  const currentTime = useCurrentTime();

  if (!stop && error) {
    throw error.message;
  }

  useEffect(() => {
    relay.refetch(oldVariables => {
      return { ...oldVariables, startTime: currentTime };
    });
  }, [currentTime, relay]);

  const { stoptimes } = stop;
  const { stopId } = match.params;
  const { constantOperationStops } = config;
  const { locale } = intl;
  if (constantOperationStops && constantOperationStops[stopId]) {
    return (
      <div className="stop-constant-operation-container">
        <div style={{ width: '85%' }}>
          <span>{constantOperationStops[stopId][locale].text}</span>
          {/* Next span inline-block so that the link doesn't render on multiple lines */}
          <span style={{ display: 'inline-block' }}>
            <a
              href={constantOperationStops[stopId][locale].link}
              target="_blank"
              rel="noreferrer"
            >
              {constantOperationStops[stopId][locale].link}
            </a>
          </span>
        </div>
      </div>
    );
  }
  const mode = getPrimaryStopMode(
    stop.routes,
    stop.vehicleMode || 'BUS',
    stop.code,
    config,
  );
  const modeColor = getModeIconColor(config, mode);
  if (!stoptimes || stoptimes.length === 0) {
    return (
      <StopServiceStatusBanner
        mode={mode}
        modeColor={modeColor}
        stoptimes={stoptimes || []}
        currentTime={currentTime}
        alerts={stop.alerts}
        servicesRunningInFuture={(stop.futureStoptimes || []).length > 0}
      />
    );
  }
  return (
    <ScrollableWrapper>
      <div className="stop-page-departure-wrapper stop-scroll-container">
        <StopServiceStatusBanner
          mode={mode}
          modeColor={modeColor}
          stoptimes={stoptimes}
          currentTime={currentTime}
          alerts={stop.alerts}
        />
        <DepartureListContainer
          stoptimes={stoptimes}
          key="departures"
          className="stop-page momentum-scroll"
          infiniteScroll
          currentTime={currentTime}
          showVehicles
        />
      </div>
    </ScrollableWrapper>
  );
}
StopPageContent.propTypes = {
  stop: stopShape.isRequired,
  relay: relayShape.isRequired,
  error: errorShape,
  match: matchShape.isRequired,
};

StopPageContent.defaultProps = {
  error: undefined,
};

const containerComponent = createRefetchContainer(
  StopPageContent,
  {
    stop: graphql`
      fragment StopPageContentContainer_stop on Stop
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        timeRange: { type: "Int!", defaultValue: 864000 }
        numberOfDepartures: { type: "Int!", defaultValue: 100 }
      ) {
        vehicleMode
        code
        url
        routes {
          gtfsId
          mode
          type
        }
        alerts(types: [STOP, ROUTES]) {
          alertEffect
          alertSeverityLevel
          effectiveStartDate
          effectiveEndDate
        }
        futureStoptimes: stoptimesWithoutPatterns(
          startTime: $startTime
          timeRange: 7776000 # 90 days in seconds
          numberOfDepartures: 1
          omitCanceled: true
        ) {
          serviceDay
        }
        stoptimes: stoptimesWithoutPatterns(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
          omitCanceled: false
        ) {
          serviceDay
          ...DepartureListContainer_stoptimes
        }
      }
    `,
  },
  graphql`
    query StopPageContentContainerQuery(
      $stopId: String!
      $startTime: Long!
      $timeRange: Int!
      $numberOfDepartures: Int!
    ) {
      stop(id: $stopId) {
        ...StopPageContentContainer_stop
          @arguments(
            startTime: $startTime
            timeRange: $timeRange
            numberOfDepartures: $numberOfDepartures
          )
      }
    }
  `,
);

export { containerComponent as default, StopPageContent as Component };
