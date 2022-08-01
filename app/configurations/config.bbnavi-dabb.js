import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-dabb-potsdam';
const APP_TITLE = 'bbnavi #DABB';
const HEADER_TITLE = '#DABB';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_2EO6l2Kg.js';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: 18,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'focus.point.lat': 52.4040281,
    'focus.point.lon': 13.0746277,
  },

  defaultEndpoint: {
    lat: 52.4040281,
    lon: 13.0746277,
  },

  defaultOrigins: [],

  MATOMO_URL,
});
