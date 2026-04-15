/* eslint-disable no-underscore-dangle */
require('@babel/register')({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob
  ignore: [
    /node_modules\/(?!react-leaflet|@babel\/runtime\/helpers\/esm|lodash-es|@digitransit-util|@digitransit-component)/,
  ],
});

// Prevent Node.js from trying to parse CSS files as JavaScript
require.extensions['.css'] = () => {};

// Stub out @hsl-fi packages that are ESM-only — they can't be require()'d by
// Node's CJS loader (ERR_REQUIRE_ESM). Unit tests don't need the real
// implementations; stubs are sufficient for shallow rendering.
const Module = require('module');

const originalLoad = Module._load;
Module._load = function hslFiStub(...args) {
  const [request] = args;
  if (request.startsWith('@hsl-fi/')) {
    return new Proxy(
      function StubComponent() {
        return null;
      },
      {
        get(target, prop) {
          if (prop === '__esModule') {
            return true;
          }
          if (prop === 'default') {
            return target;
          }
          return function StubComponent() {
            return null;
          };
        },
      },
    );
  }
  return originalLoad.apply(this, args);
};
