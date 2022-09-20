import uniqBy from 'lodash/uniqBy';

/**
 * Itinerary uniq id.
 *
 * @param {Array.<Itinerary>} itineraries
 * @returns Array.<Itinerary>
 */
const uniqItineraryId = itinerary =>
  `${itinerary.startTime}::${itinerary.endTime}`;

const uniqItineraries = itineraries => uniqBy(itineraries, uniqItineraryId);

export default uniqItineraries;
