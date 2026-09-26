/**
 * Small, side-effect-free helpers shared by digitransit-ui and the
 * digitransit-* workspace packages. Import only what you need; bundlers drop
 * the rest (`"sideEffects": false`).
 *
 * @module digitransit-util
 * @summary Util library for Digitransit-ui
 */
export { default as dayRangeAllowedDiff } from './src/dayRangeAllowedDiff.js';
export { default as dayRangePattern } from './src/dayRangePattern.js';
export { default as distance } from './src/distance.js';
export { default as enrichPatterns } from './src/enrichPatterns.js';
export { getJson, postJson } from './src/fetchJson.js';
export { default as filterMatchingToInput } from './src/filterMatchingToInput.js';
export { default as getGeocodingResults } from './src/getGeocodingResults.js';
export { default as getLabel } from './src/getLabel.js';
export { default as isDuplicate } from './src/isDuplicate.js';
export { default as isKeyboardSelectionEvent } from './src/isKeyboardSelectionEvent.js';
export { default as routeNameCompare } from './src/routeNameCompare.js';
export * from './src/searchHelpers.js';
export { default as serialize } from './src/serialize.js';
export {
  default as suggestionToLocation,
  getGtfsId,
} from './src/suggestionToLocation.js';
export {
  default as uniqueByLabel,
  formatFavouritePlaceLabel,
  getNameLabel,
  getStopCode,
} from './src/uniqueByLabel.js';
