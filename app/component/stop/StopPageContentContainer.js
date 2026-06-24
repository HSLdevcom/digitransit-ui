import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage, useIntl } from 'react-intl';
import { matchShape } from 'found';
import {
  configShape,
  errorShape,
  relayShape,
  stopShape,
} from '../../util/shapes';
import DepartureListContainer from '../DepartureListContainer';
import Icon from '../Icon';
import ScrollableWrapper from '../ScrollableWrapper';
import { transitIconName, getPrimaryStopMode } from '../../util/modeUtils';
import { getModeIconColor } from '../../util/colorUtils';
import { resolveNoDeparturesBadge } from '../../util/stopStatusUtils';
import StopScheduleStatus from './StopScheduleStatus';
import StopServiceStatusBanner from './StopServiceStatusBanner';

function StopPageContent(
  { stop, relay, currentTime, error, match },
  { config },
) {
  const intl = useIntl();
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
    const { stopStatus, badgeImg, alertEffects } = resolveNoDeparturesBadge(
      stop.alerts,
      currentTime,
      config.showStopStatusMarkers,
      (stop.futureStoptimes || []).length > 0,
    );
    return (
      <div className="stop-no-departures-container">
        <div className="stop-no-departures-icon-wrapper">
          <Icon
            img={transitIconName(mode, true)}
            className="stop-no-departures-icon"
            color={modeColor}
            viewBox="0 0 16 22"
          />
          {badgeImg && (
            <Icon img={badgeImg} className="stop-no-departures-badge" />
          )}
        </div>
        {stopStatus ? (
          <StopScheduleStatus status={stopStatus} alertEffects={alertEffects} />
        ) : (
          <FormattedMessage id="no-departures" defaultMessage="No departures" />
        )}
      </div>
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
  currentTime: PropTypes.number.isRequired,
  error: errorShape,
  match: matchShape.isRequired,
};

StopPageContent.defaultProps = {
  error: undefined,
};

StopPageContent.contextTypes = {
  config: configShape.isRequired,
};

const connectedComponent = createRefetchContainer(
  connectToStores(StopPageContent, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime(),
  })),
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
        alerts(types: [STOP]) {
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

export { connectedComponent as default, StopPageContent as Component };
