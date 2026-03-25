import PropTypes from 'prop-types';
import React from 'react';
import ScheduleTripRow from './ScheduleTripRow';
import { getFormattedTimeDate } from '../../../util/timeUtils';

const isTripCanceled = trip =>
  trip.stoptimes.length > 0 &&
  trip.stoptimes.every(st => st.realtimeState === 'CANCELED');

/**
 * Pure presentational component that returns a list of trip rows.
 * Filters out trips missing the selected from/to stoptimes.
 */
const ScheduleTripList = ({ trips, fromIdx, toIdx }) => {
  if (trips.length === 0) {
    return null;
  }

  return trips
    .filter(trip => trip.stoptimes[fromIdx] && trip.stoptimes[toIdx])
    .map(trip => {
      const fromSt = trip.stoptimes[fromIdx];
      const toSt = trip.stoptimes[toIdx];
      const departureTime = getFormattedTimeDate(
        (fromSt.serviceDay + fromSt.scheduledDeparture) * 1000,
        'HH:mm',
      );
      const arrivalTime = getFormattedTimeDate(
        (toSt.serviceDay + toSt.scheduledArrival) * 1000,
        'HH:mm',
      );

      return (
        <ScheduleTripRow
          key={`${trip.id}-${departureTime}`}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          isCanceled={isTripCanceled(trip)}
        />
      );
    });
};

ScheduleTripList.propTypes = {
  trips: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      stoptimes: PropTypes.arrayOf(
        PropTypes.shape({
          scheduledDeparture: PropTypes.number.isRequired,
          scheduledArrival: PropTypes.number.isRequired,
          serviceDay: PropTypes.number.isRequired,
          realtimeState: PropTypes.string,
        }),
      ).isRequired,
    }),
  ).isRequired,
  fromIdx: PropTypes.number.isRequired,
  toIdx: PropTypes.number.isRequired,
};

export default ScheduleTripList;
