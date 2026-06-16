import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { DateTime } from 'luxon';
import StopPageMap from '../map/StopPageMap';
import { useConfigContext } from '../../configurations/ConfigContext';
import {
  STOP_STATUS,
  getStopStatusFromStopData,
  getStopAlertEffect,
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
  const stopAlertEffect =
    stopStatus === STOP_STATUS.ALERT || stopStatus === STOP_STATUS.INFO
      ? getStopAlertEffect(stop.alerts, nowUnixTime)
      : null;

  return (
    <StopPageMap
      stop={stop}
      stopStatus={stopStatus}
      stopAlertEffect={stopAlertEffect}
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
      date: { type: "String" }
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
      alerts(types: [STOP]) {
        alertEffect
        alertSeverityLevel
        effectiveStartDate
        effectiveEndDate
      }
      stoptimesForServiceDate(date: $date, omitCanceled: true) {
        stoptimes {
          serviceDay
        }
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
