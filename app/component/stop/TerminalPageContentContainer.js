import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage, useIntl } from 'react-intl';
import DepartureListContainer from '../DepartureListContainer';
import ScrollableWrapper from '../ScrollableWrapper';
import { stationShape, errorShape, relayShape } from '../../util/shapes';
import {
  getTrackOrPierOrPlatformText,
  getPrimaryStopMode,
} from '../../util/modeUtils';
import { getModeIconColor } from '../../util/colorUtils';
import StopServiceStatusBanner from './StopServiceStatusBanner';
import { useConfigContext } from '../../configurations/ConfigContext';

function TerminalPageContent({ station, relay, currentTime, error }) {
  if (!station && error) {
    throw error.message;
  }

  useEffect(() => {
    relay.refetch(oldVariables => {
      return { ...oldVariables, startTime: currentTime };
    });
  }, [currentTime, relay]);

  const intl = useIntl();
  const config = useConfigContext();
  const { stoptimes } = station;
  const vehicleMode = station.vehicleMode || 'BUS';
  // `mode` is the icon mode (derived from routes, may differ from vehicleMode for multi-mode stops).
  // `vehicleMode` is used for track text and the departure list.
  const mode = getPrimaryStopMode(
    station.routes,
    vehicleMode,
    station.code,
    config,
    true,
  );
  const modeColor = getModeIconColor(config, mode);
  if (!stoptimes || stoptimes.length === 0) {
    return (
      <StopServiceStatusBanner
        mode={mode}
        modeColor={modeColor}
        stoptimes={stoptimes || []}
        currentTime={currentTime}
        alerts={station.alerts}
        servicesRunningInFuture={(station.futureStoptimes || []).length > 0}
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
          alerts={station.alerts}
        />
        <div
          className="departure-list-header row padding-vertical-normal"
          aria-hidden="true"
        >
          <span className="route-number-header">
            <FormattedMessage id="route" defaultMessage="Route" />
          </span>
          <span className="route-destination-header">
            <FormattedMessage id="destination" defaultMessage="Destination" />
          </span>
          <span className="time-header">
            <FormattedMessage id="leaving-at" defaultMessage="Leaves" />
          </span>
          <span className="track-header">
            {getTrackOrPierOrPlatformText(intl, vehicleMode)}
          </span>
        </div>
        <DepartureListContainer
          stoptimes={stoptimes}
          mode={vehicleMode}
          key="departures"
          className="stop-page"
          infiniteScroll
          isTerminal
          currentTime={currentTime}
          showPlatformCodes
          isTerminalPage
        />
      </div>
    </ScrollableWrapper>
  );
}

TerminalPageContent.propTypes = {
  station: stationShape.isRequired,
  relay: relayShape.isRequired,
  currentTime: PropTypes.number.isRequired,
  error: errorShape,
};

TerminalPageContent.defaultProps = {
  error: undefined,
};

const connectedComponent = createRefetchContainer(
  connectToStores(TerminalPageContent, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime(),
  })),
  {
    station: graphql`
      fragment TerminalPageContentContainer_station on Stop
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        timeRange: { type: "Int!", defaultValue: 43200 }
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
        stops {
          patterns {
            route {
              mode
            }
          }
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
    query TerminalPageContentContainerQuery(
      $terminalId: String!
      $startTime: Long!
      $timeRange: Int!
      $numberOfDepartures: Int!
    ) {
      station(id: $terminalId) {
        ...TerminalPageContentContainer_station
          @arguments(
            startTime: $startTime
            timeRange: $timeRange
            numberOfDepartures: $numberOfDepartures
          )
      }
    }
  `,
);

export { connectedComponent as default, TerminalPageContent as Component };
