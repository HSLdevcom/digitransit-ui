import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-frankfurt-oder';
const APP_TITLE = 'bbnavi Frankfurt (Oder)';
const HEADER_TITLE = 'Frankfurt (Oder)';

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
    'focus.point.lat': 52.3424526,
    'focus.point.lon': 14.5524818,
  },

  defaultEndpoint: {
    lat: 52.3424526,
    lon: 14.5524818,
  },

  defaultOrigins: [],
});
