import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-herzberg-elster';
const APP_TITLE = 'bbnavi Herzberg (Elster)';
const HEADER_TITLE = 'Herzberg (Elster)';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_Nns2ABhr.js';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: 14,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'focus.point.lat': 51.679428,
    'focus.point.lon': 13.202817,
  },

  defaultEndpoint: {
    lat: 51.679428,
    lon: 13.202817,
  },

  defaultOrigins: [],

  // todo: this is nested in transportModes/streetModes!
  // carpool: {
  //   availableForSelection: false,
  // },

  MATOMO_URL,
});
