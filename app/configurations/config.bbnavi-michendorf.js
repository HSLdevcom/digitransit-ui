import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-michendorf';
const APP_TITLE = 'bbnavi Michendorf';
const HEADER_TITLE = 'Michendorf';

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
    'focus.point.lat': 52.3164515,
    'focus.point.lon': 13.0310529,
  },

  defaultEndpoint: {
    lat: 52.3164515,
    lon: 13.0310529,
  },

  defaultOrigins: [],
});
