import { STOP_STATUS, STOP_STATUS_BADGE_IMGS } from './stopStatusUtils';

const STATUS_LAYERS = new Set([
  'stop',
  'favouriteStop',
  'station',
  'favouriteStation',
]);

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

export function getStopBadge(item) {
  if (!STATUS_LAYERS.has(getLayer(item))) {
    return null;
  }
  const gtfsId = extractGtfsId(item);
  if (!gtfsId) {
    return null;
  }
  const gtfs = item.properties?.addendum?.GTFS;
  if (gtfs?.noService) {
    return STOP_STATUS_BADGE_IMGS[STOP_STATUS.OUT_OF_SERVICE];
  }
  if (gtfs?.noServiceToday) {
    return STOP_STATUS_BADGE_IMGS[STOP_STATUS.NO_SERVICE_TODAY];
  }
  if (
    gtfs?.alertSeverity === STOP_STATUS.ALERT ||
    gtfs?.alertSeverity === STOP_STATUS.INFO
  ) {
    return STOP_STATUS_BADGE_IMGS[gtfs.alertSeverity];
  }
  return null;
}
