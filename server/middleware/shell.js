import fs from 'fs';
import path from 'path';
import serialize from 'serialize-javascript';
import getMetadata from '../../utils/shared/metaUtils.js';
import { getConfiguration } from '../configs/config.js';
import { getAnalyticsInitCode } from '../../utils/shared/analyticsUtils.js';

export function resolveLocale(config, req, res) {
  let locale = req.cookies.lang || config.defaultLanguage;
  if (!config.availableLanguages.includes(locale)) {
    locale = config.defaultLanguage;
  }
  if (req.cookies.lang !== locale) {
    res.cookie('lang', locale);
  }
  return locale;
}

function buildHead(config, req, locale, { manifest, mainAssets }) {
  const metadata = getMetadata(
    locale,
    req.hostname,
    `https://${req.hostname}${req.originalUrl}`,
    config,
  ).meta.filter(a => a !== '');

  const html = ['<head>\n'];

  metadata.forEach(m => {
    const attrs = Object.entries(m)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    html.push(`<meta ${attrs} data-react-helmet="true" />\n`);
  });

  // Write preload hints before doing anything else
  const ASSET_URL = process.env.ASSET_URL || '';
  const [themeCssPath] =
    manifest.entrypoints[`${config.CONFIG}_theme`].assets.css;
  const preloads = [
    { as: 'style', href: config.URL.FONT },
    {
      as: 'style',
      href: `${ASSET_URL}/${themeCssPath}`,
      crossorigin: true,
    },
    ...mainAssets.map(asset => ({
      as: asset.endsWith('.css') ? 'style' : 'script',
      href: `${ASSET_URL}/${asset}`,
      crossorigin: true,
    })),
  ];
  const preconnects = [config.URL.API_URL, config.URL.MAP_URL];
  if (config.staticMessagesUrl) {
    preconnects.push(config.staticMessagesUrl);
  }

  if (process.env.NODE_ENV !== 'development') {
    html.push(getAnalyticsInitCode(config, req));
  }
  preloads.forEach(({ as, href, crossorigin }) =>
    html.push(
      `<link rel="preload" as="${as}" ${
        crossorigin ? 'crossorigin' : ''
      } href="${href}">\n`,
    ),
  );
  preconnects.forEach(href =>
    html.push(`<link rel="preconnect" crossorigin href="${href}">\n`),
  );
  // First stylesheet in the document: it declares the cascade layer order.
  html.push(
    `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${themeCssPath}"/>\n`,
  );
  mainAssets
    .filter(asset => asset.endsWith('.css'))
    .forEach(asset =>
      html.push(
        `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${asset}"/>\n`,
      ),
    );

  html.push(
    `<link rel="stylesheet" type="text/css" href="${config.URL.FONT}"/>\n`,
  );
  html.push(`<script>\nwindow.config=${serialize(config)};\n</script>\n`);

  html.push('</head>\n');
  return html.join('');
}

function buildBody(config, { manifest, mainAssets, manifestScript }) {
  const ASSET_URL = process.env.ASSET_URL || '';
  const html = ['<body>\n'];

  if (process.env.NODE_ENV === 'development') {
    // Read per request, so `yarn sprites --watch` changes show on reload.
    html.push('<div>\n');
    html.push(
      fs.readFileSync(
        path.join(process.cwd(), '_static', config.sprites),
        'utf8',
      ),
    );
    html.push('</div>\n');
  } else {
    html.push('<script>\n');
    html.push(`fetch('${ASSET_URL}/${manifest[config.sprites]}')
        .then(function(response) {return response.text();}).then(function(blob) {
          var div = document.createElement('div');
          div.innerHTML = blob;
          document.body.insertBefore(div, document.body.childNodes[0]);
        });`);
    html.push('</script>\n');
  }
  html.push('<div id="app" />');
  if (manifestScript) {
    html.push('<script>');
    html.push(
      manifestScript.replace(/\/\/# sourceMappingURL=/g, `$&${ASSET_URL}/js/`),
    );
    html.push('\n</script>\n');
  }
  html.push(`<script>window.ASSET_URL="${ASSET_URL}/"</script>\n`);
  mainAssets
    .filter(asset => !asset.endsWith('.css'))
    .forEach(asset =>
      html.push(
        `<script src="${ASSET_URL}/${asset}" crossorigin defer></script>\n`,
      ),
    );

  html.push('</body>\n');
  return html.join('');
}

export default async function shell(req, res, next) {
  try {
    const sharedConfig = getConfiguration(req);
    const locale = resolveLocale(sharedConfig, req, res);
    // getConfiguration() returns a cached object shared by all requests, so
    // the request's language goes on a copy: a language stamped onto the
    // shared object would leak into concurrent requests.
    const config = { ...sharedConfig, language: locale };
    // Set by the assets middleware (see server.js).
    const { assets } = res.locals;

    // Build the full HTML document as a string before writing anything to
    // `res`. If something above (or below) throws, `next(err)` still runs
    // with no bytes sent yet, so Express's error handler can actually
    // respond - unlike the previous interleaved res.write() version, where
    // an error after the first write left headers already sent.
    const html = [
      '<!doctype html>\n',
      `<html lang="${locale}">\n`,
      buildHead(config, req, locale, assets),
      buildBody(config, assets),
      '</html>\n',
    ];

    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.send(html.join(''));
  } catch (err) {
    return next(err);
  }
}
