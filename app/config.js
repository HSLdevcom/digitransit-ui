
import htmlParser from 'htm-to-json';
import mergeWith from 'lodash/mergeWith';
import defaultConfig from './configurations/config.default';

const configs = {}; // cache merged configs for speed
const themeMap = {};
const piwikMap = [];

if (defaultConfig.themeMap) {
  Object.keys(defaultConfig.themeMap).forEach((theme) => {
    themeMap[theme] = new RegExp(defaultConfig.themeMap[theme], 'i'); // str to regex
  });
}

if (defaultConfig.piwikMap) {
  for (let i = 0; i < defaultConfig.piwikMap.length; i++) {
    piwikMap.push({
      id: defaultConfig.piwikMap[i].id,
      expr: new RegExp(defaultConfig.piwikMap[i].expr, 'i'),
    });
  }
}

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) { return srcValue; } // Return only latest if array
  return undefined; // Otherwise use default customizer
}

export function addMetaData(config) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const stats = require(`../_static/iconstats-${config.CONFIG}`);
  const html = stats.html.join(' ');

  htmlParser.convert_html_to_json(html, (err, data) => {
    if (!err) {
      data.meta.forEach((e) => {
        // eslint-disable-next-line no-param-reassign
        delete e.innerHTML;
        if (e.name === 'msapplication-config' || e.name === 'msapplication-TileImage') {
          // eslint-disable-next-line no-param-reassign
          e.content = `${stats.outputFilePrefix}${e.content}`; // fix path bug
        } else if (e.name === 'theme-color') {
          // eslint-disable-next-line no-param-reassign
          e.content = '#fff';
        }
      });
      data.link.forEach((e) => {
        // eslint-disable-next-line no-param-reassign
        delete e.innerHTML;
      });

      // eslint-disable-next-line no-param-reassign
      config.metaData = data;
      // eslint-disable-next-line no-param-reassign
      config.iconPath = stats.outputFilePrefix;
    }
  });
}

export function getNamedConfiguration(configName, piwikId) {
  const key = configName + (piwikId || '');

  if (!configs[key]) {
    let additionalConfig;

    if (configName !== 'default') {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      additionalConfig = require(`./configurations/config.${configName}`).default;
    }
    configs[key] = mergeWith({}, defaultConfig, additionalConfig, customizer);

    if (piwikId) {
      configs[key].piwikId = piwikId;
    }
  }
  return configs[key];
}

export function getConfiguration(req) {
  let configName = process.env.CONFIG || 'default';
  let host;
  let piwikId;

  if (req) {
    host = (req.headers.host && req.headers.host.split(':')[0]) || 'localhost';
  }

  if (host && process.env.NODE_ENV !== 'development'
    && (process.env.CONFIG === '' || !process.env.CONFIG)) {
    // no forced CONFIG, map dynamically
    Object.keys(themeMap).forEach((theme) => {
      if (themeMap[theme].test(host)) {
        configName = theme;
      }
    });
  }

  if (host && process.env.NODE_ENV !== 'development'
    && (!process.env.PIWIK_ID || process.env.PIWIK_ID === '')) {
    // PIWIK_ID unset, map dynamically by hostname
    for (let i = 0; i < piwikMap.length; i++) {
      if (piwikMap[i].expr.test(host)) {
        piwikId = piwikMap[i].id;
        // console.log('###PIWIK', piwikId);
        break;
      }
    }
  }
  return getNamedConfiguration(configName, piwikId);
}
