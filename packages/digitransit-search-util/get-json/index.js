import axios from 'axios';
import serialize from '@digitransit-search-util/digitransit-search-util-serialize';
/**
 *  Return Promise for a url json get request. The promise rejects on network
 *  errors, timeouts (10 s), HTTP 4xx/5xx responses (the error carries
 *  `response.status`) and response bodies that are not valid JSON.
 *
 * @name getJson
 * @param {String} url
 * @param {Array} params
 * @returns {Object} response
 * @example
 * digitransit-search-util.getJson(param1, param2);
 * //=response
 */

export default function getJson(url, params) {
  return axios
    .get(
      encodeURI(url) +
        (params
          ? (url.search(/\?/) === -1 ? '?' : '&') + serialize(params)
          : ''),
      {
        timeout: 10000,
        method: 'GET',
        // Reject non-JSON bodies (e.g. an HTML error page from a proxy)
        // instead of resolving with the raw string, which is axios's default.
        responseType: 'json',
        transitional: { silentJSONParsing: false },

        headers: {
          Accept: 'application/json',
        },
      },
    )
    .then(res => {
      return res.data;
    });
}
