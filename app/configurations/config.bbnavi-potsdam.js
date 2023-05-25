import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-potsdam';
const APP_TITLE = 'bbnavi Potsdam';
const HEADER_TITLE = 'Potsdam';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'focus.point.lat': 52.3917,
    'focus.point.lon': 13.0715,
  },

  defaultEndpoint: {
    lat: 52.3917,
    lon: 13.0715,
  },

  defaultOrigins: [],
});
