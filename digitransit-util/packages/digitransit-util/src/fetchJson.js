import serialize from './serialize.js';

const REQUEST_TIMEOUT_MS = 10000;

// fetch() has no `timeout` option, so abort through an AbortController
// instead. The timeout also covers reading the response body.
// AbortSignal.timeout() would be shorter, but iOS Safari 15 (still within
// this project's browserslist) doesn't support it.
function fetchJsonWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .then(res => res.json())
    .finally(() => clearTimeout(timer));
}

/**
 * Returns a promise for a JSON GET request, aborted after 10 seconds.
 *
 * @name getJson
 * @param {string} url
 * @param {object} [params] query parameters, serialized onto the url
 * @returns {Promise<object>} the parsed response body
 */
export function getJson(url, params) {
  return fetchJsonWithTimeout(
    encodeURI(url) +
      (params ? (url.search(/\?/) === -1 ? '?' : '&') + serialize(params) : ''),
    {
      method: 'GET',

      headers: {
        Accept: 'application/json',
      },
    },
  );
}

/**
 * Returns a promise for a JSON POST request, aborted after 10 seconds.
 *
 * @name postJson
 * @param {string} url
 * @param {object} [params] query parameters, serialized onto the url
 * @param {string} payload the request body
 * @returns {Promise<object>} the parsed response body
 */
export function postJson(url, params, payload) {
  return fetchJsonWithTimeout(
    encodeURI(url) +
      (params ? (url.search(/\?/) === -1 ? '?' : '&') + serialize(params) : ''),
    {
      method: 'POST',
      body: payload,

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );
}
