function serialize(obj, prefix) {
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

// Return Promise for a url json get request
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

// Return Promise for a json post request
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

// Return Promise for array of json get requests
export function getJsons(urls) {
  return Promise.all(urls.map(url => getJson(url)));
}
