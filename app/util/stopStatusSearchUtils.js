// Badges are served by the UI server (fetched from OTP once per day).
// The client loads the full badge map once per page load.

const STATUS_LAYERS = new Set([
  'stop',
  'favouriteStop',
  'station',
  'favouriteStation',
]);

// Module-level: populated on first preload, shared across all search instances.
let badgeMap = null;
let fetchPromise = null;

function extractGtfsId(item) {
  const fromProperties = item.properties?.gtfsId || item.gtfsId;
  if (fromProperties) {
    return fromProperties;
  }
  const gidPart = item.properties?.gid?.split('GTFS:')[1];
  if (!gidPart) {
    return undefined;
  }
  const hashIndex = gidPart.indexOf('#');
  return hashIndex === -1 ? gidPart : gidPart.substring(0, hashIndex);
}

function getLayer(item) {
  return item.properties?.layer;
}

export function preloadBadgeMap() {
  if (badgeMap !== null || fetchPromise !== null) {
    return fetchPromise || Promise.resolve();
  }
  fetchPromise = fetch('/api/stop-alert-badges')
    .then(res => res.json())
    .then(data => {
      badgeMap = data;
      fetchPromise = null;
    })
    .catch(err => {
      // Fall back to an empty map so searches still work.
      // eslint-disable-next-line no-console
      console.warn('[stopBadge] Failed to load badge map:', err.message);
      badgeMap = {};
      fetchPromise = null;
    });
  return fetchPromise;
}

export function getStopBadgeFromCache(item) {
  if (!badgeMap) {
    return null;
  }
  if (!STATUS_LAYERS.has(getLayer(item))) {
    return null;
  }
  const gtfsId = extractGtfsId(item);
  if (!gtfsId) {
    return null;
  }
  return badgeMap[gtfsId] ?? null;
}
