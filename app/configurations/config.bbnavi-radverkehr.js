import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-radverkehr';
const APP_TITLE = 'bbnavi Radverkehr';
const HEADER_TITLE = 'Radverkehr';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_vsBXzsHm.js';

// Brandenburg bounding box
const minLat = 51.36066;
const maxLat = 53.55795;
const minLon = 11.26817;
const maxLon = 14.76471;

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: 8,
    minZoom: 8,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'boundary.rect.min_lat': minLat,
    'boundary.rect.max_lat': maxLat,
    'boundary.rect.min_lon': minLon,
    'boundary.rect.max_lon': maxLon,
    'focus.point.lat': 52.5,
    'focus.point.lon': 13.3,
  },

  defaultEndpoint: {
    lat: 52.4,
    lon: 13.3,
  },

  MATOMO_URL,
});
