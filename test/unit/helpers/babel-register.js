/* eslint-disable no-underscore-dangle */
require('@babel/register')({
  // This will override `node_modules` ignoring - you can alternatively pass
  // an array of strings to be explicitly matched or a regex / glob.
  // react-leaflet is the only node_modules package our unit tests actually
  // need transpiled (its untranspiled `es/*` source is required by the
  // custom ESM loader) - verified empirically against the full test suite.
  ignore: [/node_modules\/(?!react-leaflet)/],
});

// Prevent Node.js from trying to parse CSS/SCSS files as JavaScript
require.extensions['.css'] = () => {};
require.extensions['.scss'] = () => {};

// @hsl-fi/* packages are ESM-only ("type": "module") and cannot be require()'d
// in the CommonJS test environment. Node throws ERR_REQUIRE_ESM before Babel can
// intercept the load, so we must stub these modules at Module._load level, which
// runs before Node's ESM check.
// eslint-disable-next-line import/no-commonjs
const Module = require('module');
const React = require('react');
const PropTypes = require('prop-types');

const originalLoad = Module._load;
Module._load = function interceptEsmPackages(request, ...args) {
  if (request === '@hsl-fi/dialog') {
    // Minimal interactive stub for testing app integration.
    const Modal = ({ open, onOpenChange, children }) =>
      open
        ? React.createElement(
            'div',
            {
              role: 'dialog',
              onKeyDown: event => {
                if (event.key === 'Escape') {
                  onOpenChange(false);
                }
              },
              tabIndex: -1,
            },
            children,
          )
        : null;
    Modal.propTypes = {
      open: PropTypes.bool,
      onOpenChange: PropTypes.func,
      children: PropTypes.node,
    };
    const ModalContent = ({ title, description }) =>
      React.createElement(
        'div',
        { className: 'modal-content' },
        title,
        description,
      );
    ModalContent.propTypes = {
      title: PropTypes.node,
      description: PropTypes.node,
    };
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
  // Fallback: stub any other @hsl-fi/* package generically.
  // Exceptions: CJS packages that can be loaded normally.
  if (
    request.startsWith('@hsl-fi/') &&
    request !== '@hsl-fi/utilities' &&
    request !== '@hsl-fi/content-delivery-api-types'
  ) {
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
  return originalLoad.apply(this, [request, ...args]);
};
