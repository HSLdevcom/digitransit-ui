import mergeWith from 'lodash/mergeWith';
import defaultConfig from './configurations/config.default';

const configs = {}; // cache merged configs for speed
const themeMap = {};

if (defaultConfig.themeMap) {
  Object.keys(defaultConfig.themeMap).forEach((theme) => {
    themeMap[theme] = new RegExp(defaultConfig.themeMap[theme], 'i'); // str to regex
  });
}

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) { return srcValue; } // Return only latest if array
  return undefined; // Otherwise use default customizer
}

export function getNamedConfiguration(configName) {
  if (!configs[configName]) {
    let additionalConfig;

    if (configName !== 'default') {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      additionalConfig = require(`./configurations/config.${configName}`).default;
    }
    configs[configName] = mergeWith({}, defaultConfig, additionalConfig, customizer);
  }
  return configs[configName];
}

export function getConfiguration(req) {
  if (process.env.CONFIG) {
    return getNamedConfiguration(process.env.CONFIG);
  }

  let configName = 'default';

  if (req && process.env.NODE_ENV !== 'development') {
    const host = (req.headers.host && req.headers.host.split(':')[0]);

    Object.keys(themeMap).forEach((theme) => {
      if (themeMap[theme].test(host)) {
        configName = theme;
      }
    });
  }
  return getNamedConfiguration(configName);
}
