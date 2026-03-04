/**
 * Trip processing utilities for schedule components
 * Handles trip sorting, filtering, and display logic
 */
import React from 'react';

/**
 * Sort trips by scheduled departure time
 * @param {Array} trips - Array of trip objects
 * @returns {Array|null} Sorted trips or null
 */
export const sortTrips = trips => {
  if (!trips) {
    return null;
  }

  return [...trips].sort((a, b) => {
    const aHasStoptimes = Array.isArray(a.stoptimes) && a.stoptimes.length > 0;
    const bHasStoptimes = Array.isArray(b.stoptimes) && b.stoptimes.length > 0;

    if (!bHasStoptimes) {
      return -1;
    }
    if (!aHasStoptimes) {
      return 1;
    }

    return (
      a.stoptimes[0].scheduledDeparture - b.stoptimes[0].scheduledDeparture
    );
  });
};

/**
 * Get and process trips for display.
 * @param {Object} params.patternWithTrips - Pattern object with trips
 * @param {Object} params.intl - Internationalization object
 * @param {DateTime} params.wantedDay - DateTime object for no trips message formatting (optional)
 * @returns {Object} { trips: Array|null, noTripsMessage: JSX|null }
 */
export const getTripsList = ({ patternWithTrips, intl, wantedDay }) => {
  const trips = sortTrips(patternWithTrips?.trips);
  if (!trips || trips.length === 0) {
    const formattedDate = wantedDay?.toFormat('d.L.yyyy');
    return {
      trips: null,
      noTripsMessage: (
        <div className="no-trips-message" role="alert">
          {intl.formatMessage(
            {
              id: 'no-trips-found',
              defaultMessage: `No journeys found for the selected date ${formattedDate}`,
            },
            {
              selectedDate: formattedDate,
            },
          )}
        </div>
      ),
    };
  }

  return {
    trips,
    noTripsMessage: null,
  };
};
