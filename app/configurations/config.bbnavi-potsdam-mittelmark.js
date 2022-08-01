import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-potsdam-mittelmark';
const APP_TITLE = 'bbnavi Potsdam-Mittelmark';
const HEADER_TITLE = 'Potsdam-Mittelmark';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  map: {
    zoom: 10,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  searchParams: {
    'focus.point.lat': 52.1524,
    'focus.point.lon': 12.6837,
  },

  defaultEndpoint: {
    lat: 52.1524,
    lon: 12.6837,
  },

  defaultOrigins: [],
});
