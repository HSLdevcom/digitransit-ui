import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-th-brandenburg';
const APP_TITLE = 'bbnavi TH Brandenburg';
const HEADER_TITLE = 'TH Brandenburg';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_oVwbhfUS.js';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    // zoom: undefined,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'focus.point.lat': 52.41167909055245,
    'focus.point.lon': 12.539776469044579,
  },

  defaultEndpoint: {
    lat: 52.41167909055245,
    lon: 12.539776469044579,
  },

  defaultOrigins: [],

  MATOMO_URL,
});
