// Shared between webpack.config.babel.js (build time) and server/server.js
// (request time). This placeholder is baked into the service worker's
// precache manifest URLs at build time (see the `modifyURLPrefix` option
// passed to workbox-webpack-plugin's `InjectManifest`), then swapped out
// for the real `process.env.ASSET_URL` (or an empty string, if unset) the
// first time `_static/sw.js` is requested. This preserves the CDN
// base-URL override that other, non-service-worker assets get via
// `process.env.ASSET_URL` elsewhere in the app (see app/util/publicPath.js
// and the HTML asset tags built in server/server.js), without requiring
// pre-built assets to already know their eventual CDN host.
//
// A plain string constant (not a comment marker) is used deliberately:
// Terser minification strips comments, which would silently break a
// comment-based injection marker in production builds.
module.exports = {
  ASSET_URL_PLACEHOLDER: '__DIGITRANSIT_ASSET_URL__',
};
