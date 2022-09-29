/**
 * Itinerary uniq id.
 *
 * @param {Array.<Itinerary>} itineraries
 * @returns Array.<Itinerary>
 */
const uniqItineraryId = itinerary =>
  `${itinerary.startTime}::${itinerary.endTime}`;

/**
 * Returns unique array of xs from right side.
 *
 * @param {Array} xs
 * @returns {Array}
 */
const rightUniqBy = (xs, iteratee) =>
  xs.reduceRight(
    (acc, x) => {
      const xid = iteratee(x);
      if (acc.ids.has(xid)) {
        return acc;
      }
      acc.out.unshift(x);
      acc.ids.add(xid);
      return acc;
    },
    { out: [], ids: new Set() },
  ).out;

const uniqItineraries = itineraries =>
  rightUniqBy(itineraries, uniqItineraryId);

export default uniqItineraries;
