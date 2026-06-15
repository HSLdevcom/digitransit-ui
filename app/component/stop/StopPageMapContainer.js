import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { DateTime } from 'luxon';
import StopPageMap from '../map/StopPageMap';
import { useConfigContext } from '../../configurations/ConfigContext';
import { getStopStatusFromStopData } from '../../util/stopStatusUtils';

function StopPageMapContainer({ stop }) {
  const config = useConfigContext();
  if (!stop) {
    return false;
  }

  const stopStatus = getStopStatusFromStopData({
    stop,
    nowUnixTime: DateTime.now().toUnixInteger(),
    showStopStatusMarkers: config.showStopStatusMarkers,
  });

  return <StopPageMap stop={stop} stopStatus={stopStatus} />;
}

StopPageMapContainer.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }),
};

StopPageMapContainer.defaultProps = {
  stop: undefined,
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
