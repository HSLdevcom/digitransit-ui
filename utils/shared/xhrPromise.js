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

export class HttpError extends Error {
  constructor(url, status, statusText) {
    super(`${url}: ${status} ${statusText}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

// fetch() has no `timeout` option, so abort through an AbortController
// instead. The timeout also covers reading the response body.
// AbortSignal.timeout() would be shorter, but iOS Safari 15 (still within
// this project's browserslist) doesn't support it.
// fetch() resolves on HTTP error statuses too, so reject them explicitly
// instead of passing an error body to callers as data.
function fetchJsonWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .then(res => {
      if (!res.ok) {
        throw new HttpError(url, res.status, res.statusText);
      }
      return res.json();
    })
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
