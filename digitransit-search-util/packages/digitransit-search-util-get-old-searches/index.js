import filterMatchingToInput from '@digitransit-search-util/digitransit-search-util-filter-matching-to-input';
import take from 'lodash';
/**
 * Returns matching search results that have been previously searched.
 *
 * @name getOldSearches
 * @param {Array} oldSearches Array of old search results
 * @param {String} input Search key
 * @param {Array} dropLayers Layers that is not wanted in results
 * @returns {Object}  Promise Matching old search results
 * @example
 * digitransit-search-util.getOldSearches(param1, param2);
 * //=true
 */
export default function getOldSearches(oldSearches, input, dropLayers) {
  let matchingOldSearches = filterMatchingToInput(oldSearches, input, [
    'properties.name',
    'properties.label',
    'properties.address',
    'properties.shortName',
    'properties.longName',
  ]);

  if (dropLayers) {
    // don't want these
    matchingOldSearches = matchingOldSearches.filter(
      item => !dropLayers.includes(item.properties.layer),
    );
  }

  return Promise.resolve(
    take(matchingOldSearches, 10).map(item => {
      const newItem = {
        ...item,
        type: 'OldSearch',
        timetableClicked: false, // reset latest selection action
      };
      delete newItem.properties.confidence;
      return newItem;
    }),
  );
}
