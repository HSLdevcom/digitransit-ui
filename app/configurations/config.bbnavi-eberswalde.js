import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-eberswalde';
const APP_TITLE = 'bbnavi Eberswalde';
const HEADER_TITLE = 'Eberswalde';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: undefined,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'focus.point.lat': 52.8331,
    'focus.point.lon': 13.8067,
  },

  defaultEndpoint: {
    lat: 52.8331,
    lon: 13.8067,
  },

  defaultOrigins: [],
});
