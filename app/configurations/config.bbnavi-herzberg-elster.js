import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-herzberg-elster';
const APP_TITLE = 'bbnavi Herzberg (Elster)';
const HEADER_TITLE = 'Herzberg (Elster)';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: 15,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,

  searchParams: {
    'focus.point.lat': 51.679428,
    'focus.point.lon': 13.202817,
  },

  defaultEndpoint: {
    lat: 51.679428,
    lon: 13.202817,
  },

  defaultOrigins: [],

  carpool: {
    availableForSelection: false,
  },
});
