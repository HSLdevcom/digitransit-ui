// Synchronous URL lookups for images bundled from app/assets/images/.
//
// Config values name images as a path relative to that directory, so a
// deployment can point at its own artwork without any code change.
// `import.meta.webpackContext` maps that directory at build time, so a path
// resolves immediately - no dynamic import(), no loading state.
//
// This is the app's only webpack-specific API, so it's called directly and
// try/caught: elsewhere (Vitest runs modules through Vite, which has no such
// API) `import.meta.webpackContext` is `undefined`, calling it throws, and
// every lookup misses.
let images;
try {
  images = import.meta.webpackContext('./images', {
    mode: 'sync',
    recursive: true,
    regExp: /\.(gif|jpe?g|png|svg)$/,
  });
} catch {
  images = undefined;
}

/**
 * @param {?string} path path under app/assets/images/, including the theme
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
  //
  // `images(key)` is the raw URL string itself, not `.default` - it's a raw
  // `__webpack_require__(id)`, not an ESM import, so there's no interop wrapper.
  return images.keys().includes(key) ? images(key) : undefined;
}
