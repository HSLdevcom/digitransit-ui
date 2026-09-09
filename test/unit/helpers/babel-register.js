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
// eslint-disable-next-line import/no-commonjs
const { createElement } = require('react');

// Module._load is invoked on every require() call (it bypasses Node's own
// require cache for these intercepted requests), so without caching, two
// files requiring the same @hsl-fi/* package would each get a distinct stub
// module/component instance. That breaks referential-equality-based Enzyme
// lookups (e.g. `wrapper.find(Text)`) whenever a test imports the same named
// export that a component under test also imports. Caching per request
// ensures every require() of a given package returns the same stub module,
// and every access to a given named export returns the same stub component.
const stubModuleCache = new Map();

function createNamedStubModule() {
  const namedStubs = {};
  const target = function StubComponent() {
    return null;
  };
  return new Proxy(target, {
    get(_, prop) {
      if (prop === '__esModule') {
        return true;
      }
      if (prop === 'default') {
        return target;
      }
      if (typeof prop !== 'string') {
        return undefined;
      }
      if (!namedStubs[prop]) {
        // Named so Enzyme can match it by displayName / function.name
        namedStubs[prop] = { [prop]: () => null }[prop];
      }
      return namedStubs[prop];
    },
  });
}

// @hsl-fi/layout-primitives' `Text` (and its sibling text-ish exports) is
// used purely for typography - real usages are asserted on by their actual
// rendered text content. Rather than stubbing it away to `null`, render it as
// a plain `div`/`as` tag with its `variant` prop exposed as the className, so
// tests can use @testing-library/react to find the element by its variant
// (e.g. `container.querySelector('.routes-s-narrow')`) and read its real
// text content, instead of introspecting React internals.
const TEXT_LIKE_EXPORTS = new Set(['Text', 'TextButton', 'TextLink']);

function createLayoutPrimitivesStubModule() {
  const namedStubs = {};
  const target = function StubComponent() {
    return null;
  };
  return new Proxy(target, {
    get(_, prop) {
      if (prop === '__esModule') {
        return true;
      }
      if (prop === 'default') {
        return target;
      }
      if (typeof prop !== 'string') {
        return undefined;
      }
      if (!namedStubs[prop]) {
        namedStubs[prop] = TEXT_LIKE_EXPORTS.has(prop)
          ? {
              [prop]({ children, as: Tag = 'div', variant, className } = {}) {
                return createElement(
                  Tag,
                  { className: [variant, className].filter(Boolean).join(' ') },
                  children,
                );
              },
            }[prop]
          : { [prop]: () => null }[prop];
      }
      return namedStubs[prop];
    },
  });
}

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
    // Return a cached Proxy so any named icon export resolves to the same
    // stub component on every require(). This avoids maintaining an explicit
    // list of every icon exported by the lib.
    if (!stubModuleCache.has(request)) {
      stubModuleCache.set(request, createNamedStubModule());
    }
    return stubModuleCache.get(request);
  }
  if (request === '@hsl-fi/layout-primitives') {
    if (!stubModuleCache.has(request)) {
      stubModuleCache.set(request, createLayoutPrimitivesStubModule());
    }
    return stubModuleCache.get(request);
  }
  // Fallback: stub any other @hsl-fi/* package generically.
  // Exceptions: CJS packages that can be loaded normally.
  if (
    request.startsWith('@hsl-fi/') &&
    request !== '@hsl-fi/utilities' &&
    request !== '@hsl-fi/content-delivery-api-types'
  ) {
    if (!stubModuleCache.has(request)) {
      stubModuleCache.set(request, createNamedStubModule());
    }
    return stubModuleCache.get(request);
  }
  return originalLoad.apply(this, [request, ...args]);
};
