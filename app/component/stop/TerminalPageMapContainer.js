import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { DateTime } from 'luxon';
import StopPageMap from '../map/StopPageMap';
import { useConfigContext } from '../../configurations/ConfigContext';
import {
  STOP_STATUS,
  getStopStatusFromStopData,
  getStopAlertEffects,
} from '../../util/stopStatusUtils';

function TerminalPageMapContainer({ station = undefined }) {
  const config = useConfigContext();
  if (!station) {
    return false;
  }

  const nowUnixTime = DateTime.now().toUnixInteger();
  const stopStatus = getStopStatusFromStopData({
    stop: station,
    nowUnixTime,
    showStopStatusMarkers: config.showStopStatusMarkers,
    servicesRunningOnServiceDate: (station.serviceToday || []).length > 0,
    servicesRunningInFuture:
      (station.stoptimesWithoutPatterns || []).length > 0,
  });
  const stopAlertEffects =
    stopStatus === STOP_STATUS.ALERT || stopStatus === STOP_STATUS.INFO
      ? getStopAlertEffects(station.alerts, nowUnixTime)
      : null;

  return (
    <StopPageMap
      stop={station}
      stopStatus={stopStatus}
      stopAlertEffects={stopAlertEffects}
    />
  );
}

TerminalPageMapContainer.propTypes = {
  station: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }),
};

const containerComponent = createFragmentContainer(TerminalPageMapContainer, {
  station: graphql`
    fragment TerminalPageMapContainer_station on Stop
    @argumentDefinitions(
      startOfDay: { type: "Long" }
      startTime: { type: "Long" }
      timeRange: { type: "Int", defaultValue: 7776000 } # 90 days in seconds
    ) {
      lat
      lon
      platformCode
      name
      code
      desc
      vehicleMode
      locationType
      gtfsId
      alerts(types: [STOP, ROUTES]) {
        alertEffect
        alertSeverityLevel
        effectiveStartDate
        effectiveEndDate
      }
      serviceToday: stoptimesWithoutPatterns(
        startTime: $startOfDay
        timeRange: 86400 # 1 day in seconds
        numberOfDepartures: 1
        omitCanceled: true
      ) {
        serviceDay
      }
      stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: 1
        omitCanceled: true
      ) {
        serviceDay
      }
    }
  `,
});

export { containerComponent as default, TerminalPageMapContainer as Component };
