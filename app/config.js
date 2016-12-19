// This is server render. Return correct config file.
import mergeWith from 'lodash/mergeWith';
import defaultConfig from './config.default';

let additionalConfig;

if (process.env.CONFIG && process.env.CONFIG !== 'default') {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  additionalConfig = require(`./config.${process.env.CONFIG}`).default;
}

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) { return srcValue; } // Return only latest if array
  return undefined; // Otherwise use default customizer
}

export default mergeWith({}, defaultConfig, additionalConfig, customizer);
