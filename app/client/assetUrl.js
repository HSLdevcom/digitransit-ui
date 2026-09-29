// Synchronous URL lookups for images bundled from app/client/images/.
//
// Config values name images as a path relative to that directory, so a
// deployment can point at its own artwork without any code change.
// `import.meta.webpackContext` maps that directory at build time, so a path
// resolves immediately - no dynamic import(), no loading state.
//
// This is the app's only webpack-specific API. The guard below keeps it
// harmless elsewhere (Vitest runs modules through Vite, which has no such
// API): the map is absent and every lookup misses.
const images =
  typeof import.meta.webpackContext === 'function'
    ? import.meta.webpackContext('./images', {
        mode: 'sync',
        recursive: true,
        regExp: /\.(gif|jpe?g|png|svg)$/,
      })
    : undefined;

/**
 * @param {?string} path path under app/client/images/, including the theme
 *   directory, e.g. 'hsl/reittiopas-logo.svg'. Images like the logo are
 *   optional, so several configs set them to null.
 * @returns {string|undefined} the content-hashed (and CDN-prefixed, see
 *   publicPath.js) URL, or undefined when unset or not bundled.
 */
export default function getAssetUrl(path) {
  if (!path || !images) {
    return undefined;
  }
  const key = `./${path}`;
  // keys() rather than try/catch: a context throws on an unknown key, and a
  // missing image is an expected outcome for callers that fall back.
  return images.keys().includes(key) ? images(key).default : undefined;
}
