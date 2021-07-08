import React from 'react';
import { v4 as uuid } from 'uuid';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DepartureRow from './DepartureRow';

const StopNearYouDepartureRowContainer = ({ stopTimes, mode, ...props }) => {
  const sortedStopTimes = stopTimes
    .slice()
    .sort(
      (a, b) =>
        a.serviceDay + a.realtimeArrival - (b.serviceDay + b.realtimeArrival),
    );
  const departures = sortedStopTimes.map(row => {
    const departureTime = row.serviceDay + row.realtimeArrival;
    return (
      <DepartureRow
        key={uuid()}
        departure={row}
        departureTime={departureTime}
        currentTime={props.currentTime}
        showPlatformCode={props.isStation}
      />
    );
  });
  return (
    <table className="near-departures-container">
      <thead className="sr-only">
        <tr>
          <th>
            <FormattedMessage id="route" defaultMessage="Route" />
          </th>
          <th>
            <FormattedMessage id="destination" defaultMessage="Destination" />
          </th>
          <th>
            <FormattedMessage id="leaving-at" defaultMessage="Leaves" />
          </th>
          <th>
            <FormattedMessage
              id={mode === 'BUS' ? 'platform' : 'track'}
              defaultMessage={mode === 'BUS' ? 'Platform' : 'Track'}
            />
          </th>
        </tr>
      </thead>
      <tbody>{departures}</tbody>
    </table>
  );
};

StopNearYouDepartureRowContainer.propTypes = {
  stopTimes: PropTypes.arrayOf(
    PropTypes.shape({
      distance: PropTypes.number,
    }),
  ),
  mode: PropTypes.string.isRequired,
  isStation: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
};
export default StopNearYouDepartureRowContainer;
