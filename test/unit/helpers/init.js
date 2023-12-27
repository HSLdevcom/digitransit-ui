/* eslint-disable no-console */
import { expect } from 'chai';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Link from 'found/Link';
import * as relay from 'react-relay';
import { JSDOM } from 'jsdom';
import { after, afterEach, before } from 'mocha';
import { stub } from 'sinon';
import { initAnalyticsClientSide } from '../../../app/util/analyticsUtils';

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

// set up jsdom
const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'https://localhost:8080',
});
const { window } = jsdom;

// set up test environment globals
global.window = window;
global.document = window.document;
global.navigator = {
  platform: process.platform || '',
  userAgent: 'node.js',
};
copyProps(window, global);

const config = {
  useCookiesPrompt: false,
};
// For Google Tag Manager
initAnalyticsClientSide(config);

// set up unit test globals
global.expect = expect;

// prevent mocha from interpreting imported .png or svg images
const noop = () => null;
require.extensions['.png'] = noop;
require.extensions['.svg'] = noop;

const MockLink = ({ children }) => children;
const MockQueryRenderer = ({ render }) => render();

// set up mocha hooks
before('setting up the environment', () => {
  const callback = warning => {
    throw new Error(warning);
  };
  stub(console, 'error').callsFake(callback);
  stub(Link, 'render').value(MockLink);
  stub(relay, 'QueryRenderer').value(MockQueryRenderer);
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
  window.localStorage.clear();
  window.sessionStorage.clear();
});
