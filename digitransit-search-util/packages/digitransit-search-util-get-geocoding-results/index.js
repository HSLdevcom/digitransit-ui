import getJson from '@digitransit-search-util/digitransit-search-util-get-json';

const DEFAULT_PELIAS_URL = 'https://api.digitransit.fi/geocoding/v1/search';
/**
 * <DESCRIPTION>
 *
 * @name getGeocodingResults
 * @param {String} searchString
 * @param {String} searchParams (Optional) Parameters appended to url, basically box / polygon to restrict search area
 * @param {String} lang (Optional) search language
 * @param {Object} focusPoint (Optional) Own Position (PELIAS API)
 * @param {String} sources (Optional) search sources (e.g OSM, GTFS..)
 * @param {Object} minimalRegexp (Optional) Regexp for testing
 * @returns {String} Results in JSON form
 * @example
 * digitransit-search-util.getGeocodingResults("result");
 * //= e.g. {text:"result"}
 */
export default function getGeocodingResults(
  searchString,
  searchParams,
  lang,
  focusPoint,
  sources,
  peliasUrl,
  minimalRegexp,
) {
  const text = searchString ? searchString.trim() : null;
  if (
    text === undefined ||
    text === null ||
    text.length < 1 ||
    (minimalRegexp && !minimalRegexp.test(text))
  ) {
    return Promise.resolve([]);
  }
  const PELIAS_URL = peliasUrl || DEFAULT_PELIAS_URL;
  let opts = { text, ...searchParams, ...focusPoint, lang };
  if (sources) {
    opts = { ...opts, sources };
  }
  return getJson(PELIAS_URL, opts).then(res => {
    return res.features;
  });
}
