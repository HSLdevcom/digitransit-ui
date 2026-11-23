/**
 * Parses a URL from the request (e.g. a `returnTo` param, or the first one if
 * repeated) against this site's origin.
 * @returns {URL|null} the URL if it stays on this site, else null
 */
export function parseLocalUrl(req, value) {
  const url = Array.isArray(value) ? value[0] : value;
  if (!url || typeof url !== 'string') {
    return null;
  }
  const site = URL.parse(`${req.protocol}://${req.get('host')}`);
  if (!site) {
    return null; // an invalid Host header
  }
  const parsed = URL.parse(url, site);
  if (parsed?.origin === site.origin) {
    return parsed;
  }
  return null; // another site, or not a URL
}

/**
 * The path, query and hash of `value` if it stays on this site, else `fallback`.
 * @returns {string}
 */
export function safeLocalReturnTo(req, value, fallback) {
  const url = parseLocalUrl(req, value);
  if (!url) {
    return fallback;
  }
  // `/.//host` is our path `//host`, but as a redirect `//host` is that host.
  if (url.pathname.startsWith('//')) {
    return fallback;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
