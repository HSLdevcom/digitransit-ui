// Libraries
import serialize from 'serialize-javascript';
import polyfillLibrary from 'polyfill-library';
import fs from 'fs';
import path from 'path';
import LRU from 'lru-cache';
import meta from './meta';
// configuration
import { getConfiguration } from './config';
import { getAnalyticsInitCode } from './util/analyticsUtils';

// Look up paths for various asset files
const appRoot = `${process.cwd()}/`;

// cached assets
const polyfillls = new LRU(200);

let assets;
let mainAssets;
let manifest;

if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line global-require, import/no-unresolved
  assets = require('../manifest.json');
  // eslint-disable-next-line global-require, import/no-unresolved
  mainAssets = require('../stats.json').entrypoints.main.assets.filter(
    asset => !asset.endsWith('.map'),
  );

  const manifestFiles = mainAssets.filter(asset =>
    asset.startsWith('js/runtime'),
  );

  manifest = manifestFiles
    .map(manifestFile =>
      fs.readFileSync(path.join(appRoot, '_static', manifestFile)),
    )
    .join('\n');

  mainAssets = mainAssets.filter(asset => !manifestFiles.includes(asset));
}

function getPolyfills(userAgent, config) {
  // Do not trust Samsung, LG
  // see https://digitransit.atlassian.net/browse/DT-360 and DT-445
  // Also https://github.com/Financial-Times/polyfill-service/issues/727
  if (
    !userAgent ||
    /(IEMobile|LG-|GT-|SM-|SamsungBrowser|Google Page Speed Insights)/.test(
      userAgent,
    )
  ) {
    userAgent = ''; // eslint-disable-line no-param-reassign
  }

  const normalizedUA = polyfillLibrary.normalizeUserAgent(userAgent);
  let polyfill = polyfillls.get(normalizedUA);

  if (polyfill) {
    return polyfill;
  }

  const features = {
    'caniuse:console-basic': { flags: ['gated'] },
    default: { flags: ['gated'] },
    es5: { flags: ['gated'] },
    es6: { flags: ['gated'] },
    es7: { flags: ['gated'] },
    es2017: { flags: ['gated'] },
    fetch: { flags: ['gated'] },
    Intl: { flags: ['gated'] },
    'Object.assign': { flags: ['gated'] },
    matchMedia: { flags: ['gated'] },
  };

  config.availableLanguages.forEach(language => {
    features[`Intl.~locale.${language}`] = {
      flags: ['gated'],
    };
  });

  polyfill = polyfillLibrary
    .getPolyfillString({
      uaString: userAgent,
      features,
      minify: process.env.NODE_ENV !== 'development',
      unknown: 'polyfill',
    })
    .then(polyfills =>
      // no sourcemaps for inlined js
      polyfills.replace(/^\/\/# sourceMappingURL=.*$/gm, ''),
    );

  polyfillls.set(normalizedUA, polyfill);
  return polyfill;
}

function isAssetRequest(req) {
  // Path starts with /js/, /css/ or /assets/
  return /^\/(js|css|assets)\//.test(req.path);
}

export default async function serve(req, res, next) {
  try {
    // There might a better way to throw 404 if the asset is not found before this code
    // is run.
    if (isAssetRequest(req)) {
      res.status(404);
    }

    const config = getConfiguration(req);
    const agent = req.headers['user-agent'];

    // TODO: Move this to PreferencesStore
    // 1. use locale from cookie (user selected) or default
    let locale = req.cookies.lang || config.defaultLanguage;

    const metadata = meta(
      locale,
      req.hostname,
      `https://${req.hostname}${req.originalUrl}`,
      config,
    ).meta.filter(a => a !== '');

    if (config.availableLanguages.indexOf(locale) === -1) {
      locale = config.defaultLanguage;
    }

    if (req.cookies.lang === undefined || req.cookies.lang !== locale) {
      res.cookie('lang', locale);
    }

    const polyfills = await getPolyfills(agent, config);

    const spriteName = config.sprites;

    const ASSET_URL = process.env.ASSET_URL || '';

    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.write('<!doctype html>\n');
    res.write(`<html lang="${locale}">\n`);
    res.write('<head>\n');
    metadata.forEach(m => {
      const entries = Object.entries(m);
      res.write(
        `<meta ${entries[0][0]}="${entries[0][1]}" ${entries[1][0]}="${entries[1][1]}" data-react-helmet="true" />\n`,
      );
    });

    // Write preload hints before doing anything else
    if (process.env.NODE_ENV !== 'development') {
      res.write(getAnalyticsInitCode(config, req));

      const preloads = [
        { as: 'style', href: config.URL.FONT },
        {
          as: 'style',
          href: `${ASSET_URL}/${assets[`${config.CONFIG}_theme.css`]}`,
          crossorigin: true,
        },
        ...mainAssets.map(asset => ({
          as: asset.endsWith('.css') ? 'style' : 'script',
          href: `${ASSET_URL}/${asset}`,
          crossorigin: true,
        })),
      ];

      preloads.forEach(({ as, href, crossorigin }) =>
        res.write(
          `<link rel="preload" as="${as}" ${
            crossorigin ? 'crossorigin' : ''
          } href="${href}">\n`,
        ),
      );

      const preconnects = [config.URL.API_URL, config.URL.MAP_URL];

      if (config.staticMessagesUrl) {
        preconnects.push(config.staticMessagesUrl);
      }

      preconnects.forEach(href =>
        res.write(`<link rel="preconnect" crossorigin href="${href}">\n`),
      );

      res.write(
        `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${
          assets[`${config.CONFIG}_theme.css`]
        }"/>\n`,
      );
      mainAssets
        .filter(asset => asset.endsWith('.css'))
        .forEach(asset =>
          res.write(
            `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${asset}"/>\n`,
          ),
        );
    }
    res.write(
      `<link rel="stylesheet" type="text/css" href="${config.URL.FONT}"/>\n`,
    );

    res.write(`<script>\n${polyfills}\n</script>\n`);

    res.write(`<script>\nwindow.config=${serialize(config)};\n</script>\n`);

    res.write('</head>\n');
    res.write('<body>\n');

    if (process.env.NODE_ENV !== 'development') {
      res.write('<script>\n');
      res.write(`fetch('${ASSET_URL}/${assets[spriteName]}')
          .then(function(response) {return response.text();}).then(function(blob) {
            var div = document.createElement('div');
            div.innerHTML = blob;
            document.body.insertBefore(div, document.body.childNodes[0]);
          });`);
      res.write('</script>\n');
    } else {
      res.write('<div>\n');
      res.write(fs.readFileSync(`${appRoot}_static/${spriteName}`).toString());
      res.write('</div>\n');
    }

    res.write('<div id="app" />');

    if (process.env.NODE_ENV === 'development') {
      res.write('<script async src="/proxy/js/main.js"></script>\n');
    } else {
      res.write('<script>');
      res.write(
        manifest.replace(/\/\/# sourceMappingURL=/g, `$&${ASSET_URL}/js/`),
      );
      res.write('\n</script>\n');
      res.write(`<script>window.ASSET_URL="${ASSET_URL}/"</script>\n`);
      mainAssets
        .filter(asset => !asset.endsWith('.css'))
        .forEach(asset =>
          res.write(
            `<script src="${ASSET_URL}/${asset}" crossorigin defer></script>\n`,
          ),
        );
    }
    res.write('</body>\n');
    res.write('</html>\n');
    res.end();
  } catch (err) {
    next(err);
  }
}
