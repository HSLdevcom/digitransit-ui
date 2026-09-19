/* eslint-disable no-console */
import { expect } from 'chai';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Link from 'found/Link';
import relay from 'react-relay';
import { JSDOM } from 'jsdom';
import { after, afterEach, before } from 'mocha';
import { stub } from 'sinon';
import { Settings } from 'luxon';
import { cleanup } from '@testing-library/react';
import { initAnalyticsClientSide } from '../../../utils/shared/analyticsUtils';
import {
  restoreOwnedIntlStub,
  restoreOwnedContextStubs,
} from './mock-intl-enzyme';

/**
 * Helper function to copy the properties of the source object to the
 * target object.
 *
 * @param {*} src the source object.
 * @param {*} target the target object.
 */
const copyProps = (src, target) => {
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
};

// Temporarily default NODE_ENV to 'development' for mocha's module-loading
// phase only (restored below, in the root `before` hook, before any test
// body runs). This file is loaded via mocha's `--file` flag, which
// guarantees it runs before any globbed test file's own top-level imports -
// server/** modules that read NODE_ENV at *import time* (e.g.
// server/html/assetManifest.js, which skips reading the production
// manifest.json/stats.json - absent in this environment - specifically
// under 'development') would otherwise crash before any test even starts.
// It must not stay 'development' for the actual test run: e.g.
// test/unit/server/configs/config.test.js exercises getConfiguration()'s
// host-based config lookup, which is itself gated to skip in dev mode.
const originalNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// set up timezone in luxon
Settings.defaultZone = 'Europe/Helsinki';
Settings.defaultLocale = 'fi';

// set up jsdom
const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://localhost:8080',
});
const { window } = jsdom;

// set up test environment globals
global.window = window;
global.document = window.document;

Object.defineProperty(global, 'navigator', {
  value: {
    platform: process.platform || '',
    userAgent: 'node.js',
  },
  configurable: true,
  writable: true,
});

copyProps(window, global);

const config = {
  useCookiesPrompt: false,
};
// For Google Tag Manager
initAnalyticsClientSide(config);

// set up unit test globals
global.expect = expect;

// prevent mocha from interpreting imported .png, .svg or .css files
const noop = () => null;
require.extensions['.png'] = noop;
require.extensions['.svg'] = noop;
require.extensions['.css'] = noop;

const MockLink = ({ children }) => children;

// set up mocha hooks
before('setting up the environment', () => {
  process.env.NODE_ENV = originalNodeEnv;
  const callback = warning => {
    throw new Error(warning);
  };
  stub(console, 'error').callsFake(callback);
  stub(Link, 'render').value(MockLink);
  // stub useFragment hook to return referenced object
  // this assumes that a component is given complete data as props
  stub(relay, 'useFragment').callsFake((query, ref) => ref);
  // TODO this could be renabled when dependencies don't throw warnings
  // stub(console, 'warn').callsFake(callback);
  configure({ adapter: new Adapter() });
});

after('resetting the environment', () => {
  console.error.restore();
  // TODO this could be renabled when dependencies don't throw warnings
  // console.warn.restore();
});

// make sure the local and session storage stays clear for each test
afterEach(() => {
  cleanup();
  restoreOwnedIntlStub();
  restoreOwnedContextStubs();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
