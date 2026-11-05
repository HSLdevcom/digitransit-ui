import { DateTime } from 'luxon';
/**
 Helper for determining is current date in active dates.
 Return false if pattern doesn't have active dates information available
 or if current day is not found in active days
 * */
export const isActiveDate = pattern => {
  if (!pattern || !pattern.activeDates) {
    return false;
  }

  const activeDates = pattern.activeDates.reduce((dates, activeDate) => {
    return dates.concat(activeDate.day);
  }, []);
  const now = DateTime.now().toFormat('yyyyLLdd');
  return activeDates.indexOf(now) > -1;
};

/**
 * Stop times of a pattern that are real departures from the stop:
 * drop-off-only times and arrivals to the last stop are left out.
 * The last stop is found by position, because on loop lines it is also
 * the first stop.
 */
export const getDepartureStoptimes = ({ pattern, stoptimes }) =>
  stoptimes.filter(
    st =>
      st.pickupType !== 'NONE' &&
      st.stopPositionInPattern !== pattern.stops.length - 1,
  );

/**
 * Distinct headsigns of the departures, stop time headsign first.
 */
export const getDepartureHeadsigns = stoptimeGroup => [
  ...new Set(
    getDepartureStoptimes(stoptimeGroup).map(
      st => st.headsign || stoptimeGroup.pattern.headsign,
    ),
  ),
];
