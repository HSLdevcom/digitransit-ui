import configMerger from '../util/configMerger';
import bbnaviConfig from './config.bbnavi';

const CONFIG = 'bbnavi-angermuende';
const APP_TITLE = 'bbnavi Angermünde';
const HEADER_TITLE = 'Angermünde';
const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_4BRoKipH.js';

export default configMerger(bbnaviConfig, {
  CONFIG,

  URL: {
    HEADER_TITLE,
  },

  socialMedia: {
    title: APP_TITLE,
  },

  title: APP_TITLE,
  appBarTitle: HEADER_TITLE,

  MATOMO_URL,
});
