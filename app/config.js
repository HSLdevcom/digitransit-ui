import htmlParser from 'htm-to-json';
import defaultConfig from './configurations/config.default';
import configMerger from './util/configMerger';

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

function addMetaData(config) {
  let stats;

  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    stats = require(`../_static/iconstats-${config.CONFIG}`);
  } catch (error) {
    return;
  }

  const html = stats.html.join(' ');
  const appPathPrefix = config.APP_PATH && config.APP_PATH !== '' ? `${config.APP_PATH}'/'` : '/';

  htmlParser.convert_html_to_json(html, (err, data) => {
    if (!err) {
      data.meta.forEach((e) => {
        // eslint-disable-next-line no-param-reassign
        delete e.innerHTML;
        if (e.name === 'msapplication-config' || e.name === 'msapplication-TileImage') {
          // eslint-disable-next-line no-param-reassign
          e.content = `${appPathPrefix}${stats.outputFilePrefix}${e.content}`; // fix path bug
        } else if (e.name === 'theme-color') {
          // eslint-disable-next-line no-param-reassign
          e.content = '#fff';
        } else if (e.name === 'apple-mobile-web-app-status-bar-style') {
          // eslint-disable-next-line no-param-reassign
          e.content = 'black';
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
    const config = configMerger(defaultConfig, additionalConfig);

    if (piwikId) {
      config.PIWIK_ID = piwikId;
    }
    addMetaData(config); // add dynamic metadata content

    configs[key] = config;
  }
  return configs[key];
}

export function getConfiguration(req) {
  let configName = process.env.CONFIG || 'default';
  let host;
  let piwikId;

  if (req) {
    host =
      (req.headers['x-forwarded-host'] && req.headers['x-forwarded-host'].split(':')[0]) ||
      (req.headers.host && req.headers.host.split(':')[0]) ||
      'localhost';
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
