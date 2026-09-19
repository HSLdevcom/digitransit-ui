import serialize from 'serialize-javascript';
import getMetadata from '../../utils/shared/metaUtils.js';
import { getConfiguration } from '../configs/config.js';
import { getAnalyticsInitCode } from '../../utils/shared/analyticsUtils.js';
import {
  getMainAssets,
  getManifestScript,
  getAssetPath,
  readStaticFile,
} from '../html/assetManifest.js';
import getPolyfills from '../html/polyfills.js';

export function resolveLocale(config, req, res) {
  let locale = req.cookies.lang || config.defaultLanguage;
  if (!config.availableLanguages.includes(locale)) {
    locale = config.defaultLanguage;
  }
  if (req.cookies.lang !== locale) {
    res.cookie('lang', locale);
  }
  // eslint-disable-next-line no-param-reassign
  config.language = locale;
  return locale;
}

function getAssetContext() {
  return {
    ASSET_URL: process.env.ASSET_URL || '',
    mainAssets: getMainAssets(),
  };
}

async function buildHead(config, req, locale) {
  const polyfills = await getPolyfills(req.headers['user-agent'], config);
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
  if (process.env.NODE_ENV !== 'development') {
    const { ASSET_URL, mainAssets } = getAssetContext();
    const themeCssPath = getAssetPath(`${config.CONFIG}_theme.css`);
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

    html.push(getAnalyticsInitCode(config, req));
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
    // mainAssets' CSS (e.g. the shared 'digitransit-components' chunk,
    // which contains @hsl-fi/design-system-core's default color
    // variables) must be linked *before* the theme CSS. Both define the
    // same :root custom properties, so with equal specificity, whichever
    // stylesheet is loaded (and thus applied) last wins the cascade. If
    // the theme link came first, the shared chunk's defaults would load
    // after and silently override every theme's brand colors.
    mainAssets
      .filter(asset => asset.endsWith('.css'))
      .forEach(asset =>
        html.push(
          `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${asset}"/>\n`,
        ),
      );
    html.push(
      `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${themeCssPath}"/>\n`,
    );
  }

  html.push(
    `<link rel="stylesheet" type="text/css" href="${config.URL.FONT}"/>\n`,
  );
  html.push(`<script>\n${polyfills}\n</script>\n`);
  html.push(`<script>\nwindow.config=${serialize(config)};\n</script>\n`);

  html.push('</head>\n');
  return html.join('');
}

function buildBody(config) {
  const html = ['<body>\n'];

  if (process.env.NODE_ENV === 'development') {
    html.push('<div>\n');
    html.push(readStaticFile(config.sprites).toString());
    html.push('</div>\n');
    html.push('<div id="app" />');
    html.push('<script async src="/proxy/js/main.js"></script>\n');
  } else {
    const { ASSET_URL, mainAssets } = getAssetContext();
    html.push('<script>\n');
    html.push(`fetch('${ASSET_URL}/${getAssetPath(config.sprites)}')
        .then(function(response) {return response.text();}).then(function(blob) {
          var div = document.createElement('div');
          div.innerHTML = blob;
          document.body.insertBefore(div, document.body.childNodes[0]);
        });`);
    html.push('</script>\n');
    html.push('<div id="app" />');
    html.push('<script>');
    html.push(
      getManifestScript().replace(
        /\/\/# sourceMappingURL=/g,
        `$&${ASSET_URL}/js/`,
      ),
    );
    html.push('\n</script>\n');
    html.push(`<script>window.ASSET_URL="${ASSET_URL}/"</script>\n`);
    mainAssets
      .filter(asset => !asset.endsWith('.css'))
      .forEach(asset =>
        html.push(
          `<script src="${ASSET_URL}/${asset}" crossorigin defer></script>\n`,
        ),
      );
  }

  html.push('</body>\n');
  return html.join('');
}

export default async function shell(req, res, next) {
  try {
    const config = getConfiguration(req);
    const locale = resolveLocale(config, req, res);

    // Build the full HTML document as a string before writing anything to
    // `res`. If something above (or below) throws, `next(err)` still runs
    // with no bytes sent yet, so Express's error handler can actually
    // respond - unlike the previous interleaved res.write() version, where
    // an error after the first write left headers already sent.
    const html = [
      '<!doctype html>\n',
      `<html lang="${locale}">\n`,
      await buildHead(config, req, locale),
      buildBody(config),
      '</html>\n',
    ];

    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.send(html.join(''));
  } catch (err) {
    return next(err);
  }
}
