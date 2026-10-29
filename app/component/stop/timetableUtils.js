/**
 * Stop times of a pattern that are real departures from the stop:
 * drop-off-only times and arrivals to the last stop are left out.
 */
export const getDepartureStoptimes = ({ pattern, stoptimes }) =>
  stoptimes.filter(
    st =>
      st.pickupType !== 'NONE' &&
      st.stop.gtfsId !== pattern.stops?.at(-1)?.gtfsId,
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
