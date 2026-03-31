require('@babel/register')({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob
  ignore: [
    /node_modules\/(?!react-leaflet|@babel\/runtime\/helpers\/esm|lodash-es|@digitransit-util|@digitransit-component)/,
  ],
});

// @hsl-fi/* packages are ESM-only ("type": "module") and cannot be require()'d
// in the CommonJS test environment. Node throws ERR_REQUIRE_ESM before Babel can
// intercept the load, so we must stub these modules at Module._load level, which
// runs before Node's ESM check.
// eslint-disable-next-line import/no-commonjs
const Module = require('module');

// eslint-disable-next-line no-underscore-dangle
const originalLoad = Module._load;
// eslint-disable-next-line no-underscore-dangle
Module._load = function interceptEsmPackages(request, ...args) {
  if (request === '@hsl-fi/dialog') {
    // Named arrow functions so Enzyme can match by displayName / function.name
    const Modal = () => null;
    const ModalContent = () => null;
    const ModalTrigger = () => null;
    const ConfirmationModalContent = () => null;
    const ScrollableModalContent = () => null;
    return {
      Modal,
      ModalContent,
      ModalTrigger,
      ConfirmationModalContent,
      ScrollableModalContent,
    };
  }
  if (request === '@hsl-fi/icons') {
    // Return a Proxy so any named icon export resolves to a stub component.
    // This avoids maintaining an explicit list of every icon exported by the lib.
    return new Proxy(
      {},
      {
        get(_, name) {
          // Return a named stub function so Enzyme can match it by .name
          const stub = { [name]: () => null }[name];
          return stub;
        },
      },
    );
  }
  return originalLoad.apply(this, [request, ...args]);
};
