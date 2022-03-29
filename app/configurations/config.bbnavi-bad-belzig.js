import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-bad-belzig';
const APP_TITLE = 'bbnavi Bad Belzig';
const HEADER_TITLE = 'Bad Belzig';

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

  searchParams: {
    'focus.point.lat': 52.14246,
    'focus.point.lon': 12.59488,
  },

  defaultEndpoint: {
    lat: 52.14246,
    lon: 12.59488,
  },

  defaultOrigins: [],

  carpool: {
    availableForSelection: false,
  },
});
