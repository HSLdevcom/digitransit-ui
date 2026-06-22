import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage, useIntl } from 'react-intl';
import DepartureListContainer from '../DepartureListContainer';
import Icon from '../Icon';
import ScrollableWrapper from '../ScrollableWrapper';
import { stationShape, errorShape, relayShape } from '../../util/shapes';
import {
  getTrackOrPierOrPlatformText,
  transitIconName,
  getStopMode,
} from '../../util/modeUtils';
import { getModeIconColor } from '../../util/colorUtils';
import { resolveNoDeparturesBadge } from '../../util/stopStatusUtils';
import StopScheduleStatus from './StopScheduleStatus';
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
  const routeModes = [
    ...new Set((station.routes || []).map(r => r.mode).filter(Boolean)),
  ];
  const primaryVehicleMode =
    routeModes.length === 1 ? routeModes[0] : vehicleMode;
  const mode = getStopMode(
    primaryVehicleMode,
    station.routes,
    station.code,
    config,
    true,
  );
  if (!stoptimes || stoptimes.length === 0) {
    const modeColor = getModeIconColor(config, mode);
    const { stopStatus, badgeImg, alertEffect } = resolveNoDeparturesBadge(
      station.alerts,
      currentTime,
      config.showStopStatusMarkers,
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
          <StopScheduleStatus status={stopStatus} alertEffect={alertEffect} />
        ) : (
          <FormattedMessage id="no-departures" defaultMessage="No departures" />
        )}
      </div>
    );
  }

  return (
    <ScrollableWrapper>
      <div className="stop-page-departure-wrapper stop-scroll-container">
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
        alerts(types: [STOP]) {
          alertEffect
          alertSeverityLevel
          effectiveStartDate
          effectiveEndDate
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
