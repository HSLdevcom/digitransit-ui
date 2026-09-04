/* eslint-disable no-underscore-dangle */
// Minimal jsdom + @testing-library/react environment for digitransit-component
// package tests. Deliberately smaller than test/unit/helpers/init.js (the main
// app's mocha setup): these packages test the already-built lib/*.cjs
// artifact, not raw JSX, so there's no enzyme adapter, no relay/found stubs,
// and no need to stub .png/.svg/.css requires (SVGs and SCSS are already
// compiled into the built artifact by Rollup/Babel at build time).
const { JSDOM } = require('jsdom');

// The #app div is a stand-in "app root" node: components that take an
// `appElement` prop (e.g. @hsl-fi/modal, via react-modal's aria-hider) need a
// real, permanent DOM node matching that selector to attach to - pass
// appElement="#app" in tests that render such a component.
const jsdom = new JSDOM(
  '<!doctype html><html><body><div id="app"></div></body></html>',
  { url: 'https://localhost:8080' },
);
const { window } = jsdom;

function copyProps(src, target) {
  const props = Object.getOwnPropertyNames(src)
    .filter(prop => typeof target[prop] === 'undefined')
    .reduce(
      (result, prop) => ({
        ...result,
        [prop]: Object.getOwnPropertyDescriptor(src, prop),
      }),
      {},
    );
  Object.defineProperties(target, props);
}

// jsdom doesn't implement requestAnimationFrame; React warns loudly on every
// render without it.
window.requestAnimationFrame = callback => setTimeout(callback, 0);
window.cancelAnimationFrame = id => clearTimeout(id);

global.window = window;
global.document = window.document;
Object.defineProperty(global, 'navigator', {
  value: { platform: process.platform || '', userAgent: 'node.js' },
  configurable: true,
  writable: true,
});
copyProps(window, global);

// @testing-library/dom's `screen` singleton binds to `document.body` once, at
// module-load time - it must only be required after global.document exists
// above, or its query helpers permanently throw for the rest of the process.
const { cleanup } = require('@testing-library/react');

// A `--require`d file runs before Mocha's BDD globals (describe/it/afterEach)
// exist, so a plain top-level `afterEach(...)` call would throw here. Root
// Hook Plugins (an exported `mochaHooks`) are Mocha's mechanism for exactly
// this: hooks registered by a --require'd file, applied to every test.
module.exports.mochaHooks = {
  afterEach() {
    cleanup();
  },
};
