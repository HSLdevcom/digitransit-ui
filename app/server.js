// Libraries
import serialize from 'serialize-javascript';
import polyfillLibrary from 'polyfill-library';
import fs from 'fs';
import LRU from 'lru-cache';
import meta from './meta';
// configuration
import { getConfiguration } from './config';
import { getAnalyticsInitCode } from './util/analyticsUtils';

// Look up paths for various asset files
const appRoot = `${process.cwd()}/`;

// cached assets
const polyfillls = new LRU(200);

const isDev = process.env.NODE_ENV === 'development';

/* -------------------------------------------------------------------------- *
 * Vite build manifest (production only)
 * -------------------------------------------------------------------------- */

// @vitejs/plugin-legacy inline snippets, copied verbatim from the installed
// plugin (dist/index.cjs). Re-check these if @vitejs/plugin-legacy is upgraded.
const SAFARI10_NOMODULE_FIX =
  '!function(){var e=document,t=e.createElement("script");if(!("noModule"in t)&&"onbeforeload"in t){var n=!1;e.addEventListener("beforeload",(function(e){if(e.target===t)n=!0;else if(!e.target.hasAttribute("nomodule")||!n)return;e.preventDefault()}),!0),t.type="module",t.src=".",e.head.appendChild(t),t.remove()}}();';
const SYSTEMJS_INLINE =
  "System.import(document.getElementById('vite-legacy-entry').getAttribute('data-src'))";
const DETECT_MODERN_BROWSER =
  'import.meta.url;import("_").catch(()=>1);(async function*(){})().next();if(location.protocol!="file:"){window.__vite_is_modern_browser=true}';
const DYNAMIC_FALLBACK = `!function(){if(window.__vite_is_modern_browser)return;console.warn("vite: loading legacy chunks, syntax error above and the same error below should be ignored");var e=document.getElementById("vite-legacy-polyfill"),n=document.createElement("script");n.src=e.src,n.onload=function(){${SYSTEMJS_INLINE}},document.body.appendChild(n)}();`;

let viteManifest;
let mainEntryFile; // modern entry chunk
const mainDepFiles = []; // statically imported chunks of the modern entry
const mainCssFiles = []; // css of the modern entry + its imports (cascade order)
let legacyEntryFile;
let legacyPolyfillFile;

const isLegacyFile = f => (f || '').includes('-legacy');

if (!isDev) {
  // eslint-disable-next-line global-require, import/no-unresolved
  viteManifest = require('../_static/.vite/manifest.json');
  const entries = Object.values(viteManifest);

  const modernMain = entries.find(
    e => e.isEntry && e.name === 'main' && !isLegacyFile(e.file),
  );
  const legacyMain = entries.find(
    e => e.isEntry && e.name === 'main' && isLegacyFile(e.file),
  );
  const legacyPoly = entries.find(
    e => e.isEntry && (e.file || '').includes('polyfills-legacy'),
  );

  const seen = new Set();
  const walk = key => {
    const entry = typeof key === 'string' ? viteManifest[key] : key;
    if (!entry || seen.has(entry.file)) {
      return;
    }
    seen.add(entry.file);
    if (entry !== modernMain) {
      mainDepFiles.push(entry.file);
    }
    (entry.css || []).forEach(c => {
      if (!mainCssFiles.includes(c)) {
        mainCssFiles.push(c);
      }
    });
    (entry.imports || []).forEach(walk);
  };
  walk(modernMain);

  mainEntryFile = modernMain.file;
  legacyEntryFile = legacyMain && legacyMain.file;
  legacyPolyfillFile = legacyPoly && legacyPoly.file;
}

function themeCssFor(configName) {
  if (!viteManifest) {
    return undefined;
  }
  const entries = Object.values(viteManifest);
  const pick = name =>
    entries.find(e => e.isEntry && e.name === name && !isLegacyFile(e.file));
  const entry = pick(`${configName}_theme`) || pick('default_theme');
  return entry && entry.css && entry.css[0];
}

/* -------------------------------------------------------------------------- */

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

function metaTags(metadata) {
  return metadata
    .map(m => {
      const entries = Object.entries(m);
      return `<meta ${entries[0][0]}="${entries[0][1]}" ${entries[1][0]}="${entries[1][1]}" data-react-helmet="true" />`;
    })
    .join('\n');
}

/* -------------------------------------------------------------------------- *
 * Production: assemble the HTML shell from the Vite manifest
 * -------------------------------------------------------------------------- */
function serveProd(
  req,
  res,
  { config, locale, metadata, polyfills, spriteName },
) {
  const ASSET_URL = process.env.ASSET_URL || '';
  const abs = p => `${ASSET_URL}/${p}`;
  const themeCss = themeCssFor(config.CONFIG);

  const out = [];
  out.push('<!doctype html>');
  out.push(`<html lang="${locale}">`);
  out.push('<head>');
  out.push(metaTags(metadata));

  out.push(getAnalyticsInitCode(config, req));

  // preload / modulepreload hints
  const preloads = [
    { as: 'style', href: config.URL.FONT },
    ...(themeCss
      ? [{ as: 'style', href: abs(themeCss), crossorigin: true }]
      : []),
    ...mainCssFiles.map(c => ({
      as: 'style',
      href: abs(c),
      crossorigin: true,
    })),
  ];
  preloads.forEach(({ as, href, crossorigin }) =>
    out.push(
      `<link rel="preload" as="${as}" ${
        crossorigin ? 'crossorigin' : ''
      } href="${href}">`,
    ),
  );
  mainDepFiles.forEach(f =>
    out.push(`<link rel="modulepreload" crossorigin href="${abs(f)}">`),
  );

  const preconnects = [config.URL.API_URL, config.URL.MAP_URL];
  if (config.staticMessagesUrl) {
    preconnects.push(config.staticMessagesUrl);
  }
  preconnects.forEach(href =>
    out.push(`<link rel="preconnect" crossorigin href="${href}">`),
  );

  // Stylesheets in cascade order: the shared chunk CSS (which carries
  // @hsl-fi/design-system-core's :root defaults) must come *before* the
  // per-config theme CSS, since both define the same custom properties and
  // the later one wins.
  mainCssFiles.forEach(c =>
    out.push(
      `<link rel="stylesheet" type="text/css" crossorigin href="${abs(c)}"/>`,
    ),
  );
  if (themeCss) {
    out.push(
      `<link rel="stylesheet" type="text/css" crossorigin href="${abs(
        themeCss,
      )}"/>`,
    );
  }
  out.push(
    `<link rel="stylesheet" type="text/css" href="${config.URL.FONT}"/>`,
  );

  out.push(`<script>\n${polyfills}\n</script>`);
  out.push(`<script>\nwindow.config=${serialize(config)};\n</script>`);

  // @vitejs/plugin-legacy: modern-browser detection + legacy fallback loader
  if (legacyEntryFile && legacyPolyfillFile) {
    out.push(`<script type="module">${DETECT_MODERN_BROWSER}</script>`);
    out.push(`<script type="module">${DYNAMIC_FALLBACK}</script>`);
  }

  out.push('</head>');
  out.push('<body>');

  // SVG sprite: fetched and inlined at runtime (served verbatim from static/)
  out.push('<script>');
  out.push(`fetch('${abs(spriteName)}')
      .then(function(response) {return response.text();}).then(function(blob) {
        var div = document.createElement('div');
        div.innerHTML = blob;
        document.body.insertBefore(div, document.body.childNodes[0]);
      });`);
  out.push('</script>');

  out.push('<div id="app" />');

  // @vitejs/plugin-legacy: nomodule bundle for browsers without ES module support
  if (legacyEntryFile && legacyPolyfillFile) {
    out.push(`<script nomodule>${SAFARI10_NOMODULE_FIX}</script>`);
    out.push(
      `<script nomodule crossorigin id="vite-legacy-polyfill" src="${abs(
        legacyPolyfillFile,
      )}"></script>`,
    );
    out.push(
      `<script nomodule crossorigin id="vite-legacy-entry" data-src="${abs(
        legacyEntryFile,
      )}">${SYSTEMJS_INLINE}</script>`,
    );
  }

  // modern entry (module scripts are deferred by default)
  out.push(
    `<script type="module" crossorigin src="${abs(mainEntryFile)}"></script>`,
  );

  out.push('</body>');
  out.push('</html>');

  res.setHeader('content-type', 'text/html; charset=utf-8');
  return res.end(out.join('\n'));
}

/* -------------------------------------------------------------------------- *
 * Development: Vite middleware mode. Build a minimal shell and let Vite inject
 * its HMR client + the React refresh preamble via transformIndexHtml.
 * -------------------------------------------------------------------------- */
async function serveDev(
  req,
  res,
  { config, locale, metadata, polyfills, spriteName },
) {
  const { vite } = req.app.locals;
  const sprite = fs.readFileSync(`${appRoot}_static/${spriteName}`).toString();

  // Keep the (huge, control-char-laden) polyfill + config scripts out of the
  // string handed to transformIndexHtml — parse5 rejects them. Inject them into
  // <head> after Vite has added its HMR client / refresh preamble.
  const shell = `<!doctype html>
<html lang="${locale}">
<head>
${metaTags(metadata)}
<link rel="stylesheet" type="text/css" href="${config.URL.FONT}"/>
</head>
<body>
<div>${sprite}</div>
<div id="app" />
<script type="module" src="/app/client.js"></script>
</body>
</html>`;

  let html = await vite.transformIndexHtml(req.originalUrl, shell);
  const headScripts = `<script>\n${polyfills}\n</script>\n<script>\nwindow.config=${serialize(
    config,
  )};\n</script>\n`;
  html = html.replace('</head>', `${headScripts}</head>`);

  res.setHeader('content-type', 'text/html; charset=utf-8');
  return res.end(html);
}

export default async function serve(req, res, next) {
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

    if (isDev) {
      return await serveDev(req, res, {
        config,
        locale,
        metadata,
        polyfills,
        spriteName,
      });
    }
    return serveProd(req, res, {
      config,
      locale,
      metadata,
      polyfills,
      spriteName,
    });
  } catch (err) {
    return next(err);
  }
}
