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

function StopPageMapContainer({ stop = undefined }) {
  const config = useConfigContext();
  if (!stop) {
    return false;
  }

  const nowUnixTime = DateTime.now().toUnixInteger();
  const stopStatus = getStopStatusFromStopData({
    stop,
    nowUnixTime,
    showStopStatusMarkers: config.showStopStatusMarkers,
  });
  const stopAlertEffects =
    stopStatus === STOP_STATUS.ALERT || stopStatus === STOP_STATUS.INFO
      ? getStopAlertEffects(stop.alerts, nowUnixTime)
      : null;

  return (
    <StopPageMap
      stop={stop}
      stopStatus={stopStatus}
      stopAlertEffects={stopAlertEffects}
    />
  );
}

StopPageMapContainer.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }),
};

const containerComponent = createFragmentContainer(StopPageMapContainer, {
  stop: graphql`
    fragment StopPageMapContainer_stop on Stop
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

export { containerComponent as default, StopPageMapContainer as Component };
