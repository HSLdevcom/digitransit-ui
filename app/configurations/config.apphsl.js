/* eslint-disable prefer-template */
import configMerger from '../util/configMerger';

const CONFIG = 'apphsl';
const hslConfig = require('./config.hsl').default;

export default configMerger(hslConfig, {
  CONFIG,
  hideHeader: true,
  indexPath: '',
  useCookiesPrompt: false,
});
