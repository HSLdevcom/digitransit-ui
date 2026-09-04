/* eslint no-restricted-globals: warn */
/*
 * Service worker entry point, built by workbox-webpack-plugin's
 * InjectManifest mode (see webpack.config.babel.js). This file is the
 * *source* for the built `_static/sw.js` - it goes through the normal
 * webpack module resolution (hence the plain imports below), and
 * `self.__WB_MANIFEST` is replaced at build time with the list of
 * hashed build assets to precache.
 *
 * This replaces the previous `offline-plugin` based service worker.
 * Notably, `offline-plugin` let a `ServiceWorker.entry` file (formerly
 * `app/util/font-sw.js`) be merged into its generated caching logic -
 * this file now plays both roles directly.
 */
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

// Precache the hashed build assets (JS/CSS chunks etc). Entries whose
// URLs already carry a content hash never need revision tracking, so
// stale caches are simply superseded by new URLs on the next deploy.
// `self.__WB_MANIFEST` entry URLs are prefixed at build time (see the
// `modifyURLPrefix` option passed to `InjectManifest`) with a
// placeholder token, which `server/server.js` replaces at request time
// with the deployment's `ASSET_URL` (or with an empty string when
// `ASSET_URL` is unset) - this preserves the CDN base URL override that
// previously ran through `server/swInjection.js`.
// `__WB_MANIFEST` is workbox-webpack-plugin's standard injection point name.
// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST);

// Old, now-superseded precached revisions are cleared automatically.
cleanupOutdatedCaches();

// Apply updates immediately instead of waiting for all tabs to close.
// This mirrors the previous `OfflinePlugin.install({ onUpdateReady: () =>
// OfflinePlugin.applyUpdate() })` behaviour in app/client.js.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event =>
  event.waitUntil(self.clients.claim()),
);

// Images/SVGs/GeoJSON and stylesheets are numerous, non-essential for the
// app shell to function, and previously were only "optionally" precached
// (safeToUseOptionalCaches: true). Rather than risk failing the whole SW
// install if one of these 404s, cache them lazily on first successful
// fetch instead of eagerly during install.
registerRoute(
  ({ url }) => /\.(png|svg|geojson)$/.test(url.pathname),
  new CacheFirst({ cacheName: 'optional-assets' }),
);
registerRoute(
  ({ url, sameOrigin }) => sameOrigin && /\.css$/.test(url.pathname),
  new CacheFirst({ cacheName: 'optional-assets' }),
);

// External font stylesheets/files (HSL's Typography.com-hosted CSS files,
// and Google-hosted static webfont files) - cached the same way
// `offline-plugin`'s `externals` cache list did, but as lazy runtime
// caching rather than an eager (and unreliable, since they're
// third-party) part of the SW install step.
// src for google fonts might change so https://fonts.gstatic.com addresses
// might require some maintenance in this list to still keep them cached by
// the service worker in the future.
const EXTERNAL_FONT_URLS = new Set([
  'https://prod.hslfi.hsldev.com/fonts/784131/007A16DD5A18D7C65.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/02F09E5BF2B925BD4.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/076040301BB485C9D.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/1346928704B9283E5.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/1CEFF336D57976EB3.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/1DEEABB198BE4D63F.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/22BA455A4091CC19F.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/2566FE490EDCD6F67.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/277846DB00CF3DB06.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/29B67461E5589EE74.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/2D217B7668941A793.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/3253FBE4A5A578F2D.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/52619AB133F6BB86A.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/532E82510FFBBD207.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/534F8B08DDF1CC33C.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/5604F98701832EA61.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/5F469DF892D6FD752.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/6C5FB8083F348CFBB.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/700C98F3EEEA5EA60.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/7FEEF2DCF7989828E.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/80E39C8AEE33E2FB1.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/85C0D47CA441BAC9A.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/86C88F4E5D2372CB2.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/8819A4AEF420691AB.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/8A8537319E1714352.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/8D4A612AC08BB49AA.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/9A41B5190DBEBADE0.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/B037480DAA4A9B18C.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/B378660B7DF3850A2.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/B3B6DD3CB8EB8281F.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/B45A71222EB5CBFF4.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/B6BF52DDCDAE17D49.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/BE27263FF5E4969A1.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/C54DDF82AD3DE0D70.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/C593C722D057C1CB2.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/C704C82D97246BB50.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/D01FA66F6F11C1D46.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/D147F710C34D01D03.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/E8B40404B085B82FD.css',
  'https://prod.hslfi.hsldev.com/fonts/784131/F694B0ED52086B2B4.css',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu7GxKOzY.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfChc4EsA.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc4.woff2',
  'https://fonts.gstatic.com/s/robotocondensed/v19/ieVl2ZhZI2eCN5jzbjEETS9weq8-19y7DRs5.woff2',
  'https://fonts.gstatic.com/s/robotocondensed/v19/ieVl2ZhZI2eCN5jzbjEETS9weq8-19K7DQ.woff2',
  'https://fonts.gstatic.com/s/robotocondensed/v19/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCoYb8td.woff2',
  'https://fonts.gstatic.com/s/robotocondensed/v19/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCQYbw.woff2',
]);
registerRoute(
  ({ url }) => EXTERNAL_FONT_URLS.has(url.href),
  new CacheFirst({ cacheName: 'external-fonts' }),
);

// cloud.typography.com fonts need click-counting on *every* request (per
// HSL's Typography.com licensing terms), so they can't use a normal
// cache-first workbox route - they need a background refetch on every
// cache hit. This logic is unchanged from the previous, pre-workbox
// implementation (formerly `app/util/font-sw.js`).
const TYPOGRAPHY_CACHE = 'font-cache-v1';
const TYPOGRAPHY_DOMAIN = 'https://cloud.typography.com/';

function fetchAndCacheTypographyFont(request, cache) {
  return fetch(request.clone()).then(response => {
    if (response.status < 400) {
      cache.put(request, response.clone());
    }
    return response;
  });
}

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(TYPOGRAPHY_DOMAIN)) {
    return;
  }

  event.respondWith(
    caches.open(TYPOGRAPHY_CACHE).then(cache =>
      cache
        .match(event.request)
        .then(cacheResponse => {
          if (cacheResponse) {
            // Required to fetch the fonts for every page load, we also use this to refresh the cache.
            fetchAndCacheTypographyFont(event.request, cache);
            return cacheResponse;
          }
          return fetchAndCacheTypographyFont(event.request, cache);
        })
        .catch(error => {
          throw error;
        }),
    ),
  );
});
