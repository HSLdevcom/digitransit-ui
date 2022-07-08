import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-bernau-bei-berlin';
const APP_TITLE = 'bbnavi Bernau';
const HEADER_TITLE = 'Bernau';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_yHcKbzwR.js';

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
    'focus.point.lat': 52.675386,
    'focus.point.lon': 13.59196,
  },

  defaultEndpoint: {
    lat: 52.675386,
    lon: 13.59196,
  },

  defaultOrigins: [],

  MATOMO_URL,
});
