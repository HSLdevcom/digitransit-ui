import serialize from '@digitransit-search-util/digitransit-search-util-serialize';
/**
 *  Return Promise for a url json get request
 *
 * @name getJson
 * @param {String} url
 * @param {Array} params
 * @returns {Object} response
 * @example
 * digitransit-search-util.getJson(param1, param2);
 * //=response
 */
const fetch = require('node-fetch');

export default function getJson(url, params) {
  return fetch(
    encodeURI(url) +
      (params ? (url.search(/\?/) === -1 ? '?' : '&') + serialize(params) : ''),
    {
      timeout: 10000,
      method: 'GET',

      headers: {
        Accept: 'application/json',
      },
    },
  ).then(res => res.json());
}
