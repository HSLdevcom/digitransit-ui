import htmlParser from 'htm-to-json';
import defaultConfig from './configurations/config.default';
import configMerger from './util/configMerger';
import { boundWithMinimumAreaSimple } from './util/geo-utils';

const configs = {}; // cache merged configs for speed
const themeMap = {};

if (defaultConfig.themeMap) {
  Object.keys(defaultConfig.themeMap).forEach(theme => {
    themeMap[theme] = new RegExp(defaultConfig.themeMap[theme], 'i'); // str to regex
  });
}

function addMetaData(config) {
  let stats;

  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    stats = require(`../_static/assets/iconstats-${config.CONFIG}`);
  } catch (error) {
    return;
  }

  const html = stats.html.join(' ');
  const APP_PATH =
    config.APP_PATH && config.APP_PATH !== '' ? `${config.APP_PATH}'/'` : '/';
  const appPathPrefix = config.URL.ASSET_URL || APP_PATH;

  htmlParser.convert_html_to_json(html, (err, data) => {
    if (!err) {
      data.meta.forEach(e => {
        // eslint-disable-next-line no-param-reassign
        delete e.innerHTML;
        if (
          e.name === 'msapplication-config' ||
          e.name === 'msapplication-TileImage'
        ) {
          // eslint-disable-next-line no-param-reassign
          e.content = `${appPathPrefix}${stats.outputFilePrefix}${e.content}`; // fix path bug
        } else if (e.name === 'theme-color') {
          // eslint-disable-next-line no-param-reassign
          e.content = '#fff';
        } else if (e.name === 'apple-mobile-web-app-status-bar-style') {
          // eslint-disable-next-line no-param-reassign
          e.content = 'white';
        }
      });
      data.link.forEach(e => {
        // eslint-disable-next-line no-param-reassign
        delete e.innerHTML;
        if (config.URL.ASSET_URL && e.href.startsWith('/icons')) {
          e.href = appPathPrefix + e.href;
        }
      });

      // eslint-disable-next-line no-param-reassign
      config.metaData = data;
      // eslint-disable-next-line no-param-reassign
      config.iconPath = stats.outputFilePrefix;
    }
  });
}

export function getNamedConfiguration(configName) {
  if (!configs[configName]) {
    let additionalConfig;

    if (configName !== 'default') {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      additionalConfig = require(`./configurations/config.${configName}`)
        .default;
    }

    // use cached baseConfig that is potentially patched in server start up
    // for merge if one is configured
    const baseConfig = configs[process.env.BASE_CONFIG];
    const config = baseConfig
      ? configMerger(baseConfig, additionalConfig)
      : configMerger(defaultConfig, additionalConfig);

    if (config.useSearchPolygon && config.areaPolygon) {
      // pass poly as 'lon lat, lon lat, lon lat ...' sequence
      const pointsParam = config.areaPolygon
        .map(p => `${p[0]} ${p[1]}`)
        .join(',');

      config.searchParams = config.searchParams || {};
      config.searchParams['boundary.polygon'] = pointsParam;
    }

    Object.keys(config.modePolygons).forEach(mode => {
      const boundingBoxes = [];
      config.modePolygons[mode].forEach(polygon => {
        boundingBoxes.push(boundWithMinimumAreaSimple(polygon));
      });
      config.modeBoundingBoxes = config.modeBoundingBoxes || {};
      config.modeBoundingBoxes[mode] = boundingBoxes;
    });
    Object.keys(config.realTimePatch).forEach(realTimeKey => {
      config.realTime[realTimeKey] = {
        ...(config.realTime[realTimeKey] || {}),
        ...config.realTimePatch[realTimeKey],
      };
    });

    addMetaData(config); // add dynamic metadata content

    if (!process.env.OIDC_CLIENT_ID) {
      // disable user account access if backend is not available
      config.showLogin = false;
    }

    const appPathPrefix = config.URL.ASSET_URL || '';

    if (config.geoJson && Array.isArray(config.geoJson.layers)) {
      for (let i = 0; i < config.geoJson.layers.length; i++) {
        const layer = config.geoJson.layers[i];
        if (layer.url.indexOf('http') !== 0) {
          layer.url = appPathPrefix + layer.url;
        }
      }
    }

    configs[configName] = config;
  }
  return configs[configName];
}

export function getConfiguration(req) {
  let configName = process.env.CONFIG || process.env.BASE_CONFIG || 'default';
  let host;

  if (req) {
    host =
      (req.headers['x-forwarded-host'] &&
        req.headers['x-forwarded-host'].split(':')[0]) ||
      (req.headers.host && req.headers.host.split(':')[0]) ||
      'localhost';
  }

  if (
    host &&
    process.env.NODE_ENV !== 'development' &&
    (process.env.CONFIG === '' || !process.env.CONFIG)
  ) {
    // no forced CONFIG, map dynamically
    Object.keys(themeMap).forEach(theme => {
      if (themeMap[theme].test(host)) {
        configName = theme;
      }
    });
  }

  return getNamedConfiguration(configName);
}
