import serialize from '@digitransit-search-util/digitransit-search-util-serialize';
import axios from 'axios';

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

        headers: {
          Accept: 'application/json',
        },
      },
    )
    .then(res => {
      return res.data;
    });
}
