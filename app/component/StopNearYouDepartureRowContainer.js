import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import LocalTime from './LocalTime';

const DepartureRow = ({ departure }) => {
  const mode = departure.trip.route.mode.toLowerCase();
  return (
    <div className={cx('near-departure-row', mode)}>
      <div className="near-route-number-container">
        <div className="near-route-number">
          {departure.trip.route.shortName}
        </div>
      </div>
      <div className="near-route-headsign">{departure.headsign}</div>
      <div className={cx('near-route-time', { realtime: departure.realtime })}>
        <LocalTime time={departure.serviceDay + departure.realtimeArrival} />
      </div>
    </div>
  );
};

const StopNearYouDepartureRowContainer = ({ stopTimes }) => {
  const departures = stopTimes.map(row => (
    <DepartureRow
      key={`${row.trip.route.gtfsId}_${row.realtimeArrival}`}
      departure={row}
    />
  ));

  return <div className="near-departures-container">{departures}</div>;
};

DepartureRow.propTypes = {
  departure: PropTypes.object.isRequired,
};
StopNearYouDepartureRowContainer.propTypes = {
  stopTimes: PropTypes.arrayOf(
    PropTypes.shape({
      distance: PropTypes.number,
    }),
  ),
};
export default StopNearYouDepartureRowContainer;
