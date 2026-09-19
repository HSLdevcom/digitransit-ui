import serialize from 'serialize-javascript';
import meta from '../../utils/shared/meta.js';
import { getConfiguration } from '../configs/config.js';
import { getAnalyticsInitCode } from '../../utils/shared/analyticsUtils.js';
import {
  getMainAssets,
  getManifestScript,
  getAssetPath,
  readStaticFile,
} from '../html/assetManifest.js';
import getPolyfills from '../html/polyfills.js';

function isAssetRequest(req) {
  // Path starts with /js/, /css/ or /assets/
  return /^\/(js|css|assets)\//.test(req.path);
}

export default async function shell(req, res, next) {
  try {
    // There might a better way to throw 404 if the asset is not found
    //  before this code is run.
    if (isAssetRequest(req)) {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      res.setHeader('Cloudflare-CDN-Cache-Control', 'no-store');
      return res.status(404).type('text/plain').send('Static asset not found');
    }

    const config = getConfiguration(req);
    const agent = req.headers['user-agent'];

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

    config.language = locale;

    if (req.cookies.lang === undefined || req.cookies.lang !== locale) {
      res.cookie('lang', locale);
    }

    const polyfills = await getPolyfills(agent, config);

    const spriteName = config.sprites;
    const ASSET_URL = process.env.ASSET_URL || '';
    const isDev = process.env.NODE_ENV === 'development';
    const mainAssets = getMainAssets();

    // Build the full HTML document as a string before writing anything to
    // `res`. If something above (or below) throws, `next(err)` still runs
    // with no bytes sent yet, so Express's error handler can actually
    // respond - unlike the previous interleaved res.write() version, where
    // an error after the first write left headers already sent.
    const html = [];
    html.push('<!doctype html>\n');
    html.push(`<html lang="${locale}">\n`);
    html.push('<head>\n');
    metadata.forEach(m => {
      const entries = Object.entries(m);
      html.push(
        `<meta ${entries[0][0]}="${entries[0][1]}" ${entries[1][0]}="${entries[1][1]}" data-react-helmet="true" />\n`,
      );
    });

    // Write preload hints before doing anything else
    if (!isDev) {
      html.push(getAnalyticsInitCode(config, req));

      const preloads = [
        { as: 'style', href: config.URL.FONT },
        {
          as: 'style',
          href: `${ASSET_URL}/${getAssetPath(`${config.CONFIG}_theme.css`)}`,
          crossorigin: true,
        },
        ...mainAssets.map(asset => ({
          as: asset.endsWith('.css') ? 'style' : 'script',
          href: `${ASSET_URL}/${asset}`,
          crossorigin: true,
        })),
      ];

      preloads.forEach(({ as, href, crossorigin }) =>
        html.push(
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
        `<link rel="stylesheet" type="text/css" crossorigin href="${ASSET_URL}/${getAssetPath(
          `${config.CONFIG}_theme.css`,
        )}"/>\n`,
      );
    }
    html.push(
      `<link rel="stylesheet" type="text/css" href="${config.URL.FONT}"/>\n`,
    );

    html.push(`<script>\n${polyfills}\n</script>\n`);

    html.push(`<script>\nwindow.config=${serialize(config)};\n</script>\n`);

    html.push('</head>\n');
    html.push('<body>\n');

    if (!isDev) {
      html.push('<script>\n');
      html.push(`fetch('${ASSET_URL}/${getAssetPath(spriteName)}')
          .then(function(response) {return response.text();}).then(function(blob) {
            var div = document.createElement('div');
            div.innerHTML = blob;
            document.body.insertBefore(div, document.body.childNodes[0]);
          });`);
      html.push('</script>\n');
    } else {
      html.push('<div>\n');
      html.push(readStaticFile(spriteName).toString());
      html.push('</div>\n');
    }

    html.push('<div id="app" />');

    if (isDev) {
      html.push('<script async src="/proxy/js/main.js"></script>\n');
    } else {
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
    html.push('</html>\n');

    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.send(html.join(''));
  } catch (err) {
    return next(err);
  }
}
