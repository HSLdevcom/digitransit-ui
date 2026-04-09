const Module = require('module');

// Stub ESM-only @hsl-fi packages that cannot be require()'d
const hslFiStubs = {
  '@hsl-fi/site-header': { SiteHeader: () => null, UserMenu: () => null },
  '@hsl-fi/design-system-core': { Fonts: () => null },
};

/* eslint-disable no-underscore-dangle */
const originalLoad = Module._load;
Module._load = function stubEsmPackages(request, ...args) {
  if (Object.prototype.hasOwnProperty.call(hslFiStubs, request)) {
    return hslFiStubs[request];
  }
  return originalLoad.apply(this, [request, ...args]);
};
/* eslint-enable no-underscore-dangle */

// Ignore CSS imports in test environment
require.extensions['.css'] = () => {};

require('@babel/register')({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob
  ignore: [
    /node_modules\/(?!react-leaflet|@babel\/runtime\/helpers\/esm|lodash-es|@digitransit-util|@digitransit-component)/,
  ],
});
