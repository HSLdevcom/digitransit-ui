/**
 * @module digitransit-search-util-serialize
 * @deprecated Merged into `@digitransit-util/digitransit-util` - import
 * serialize from there instead. This package will be removed in a future
 * release.
 */
/**
 * Serializes objects
 *
 * @name serialize
 * @param {Object} obj Object to be serialized
 * @param {Any} prefix
 * @returns {String} Serialized object
 * @example
 * digitransit-search-util.serialize(param1, param2);
 * //=true
 */
export default function serialize(obj, prefix) {
  if (!obj) {
    return '';
  }
  return Object.keys(obj)
    .map(p => {
      const k = prefix || p;
      const v = obj[p];

      return typeof v === 'object'
        ? serialize(v, k)
        : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    })
    .join('&');
}
