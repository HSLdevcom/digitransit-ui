import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-fuerstenberg-havel';
const APP_TITLE = 'bbnavi Fürstenberg (Havel)';
const HEADER_TITLE = 'Fürstenberg (Havel)';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_M1eo1mXj.js';

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
    'focus.point.lat': 53.186632,
    'focus.point.lon': 13.139192,
  },

  defaultEndpoint: {
    lat: 53.186632,
    lon: 13.139192,
  },

  defaultOrigins: [],

  MATOMO_URL,
});
