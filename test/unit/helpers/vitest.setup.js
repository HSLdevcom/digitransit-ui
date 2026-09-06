/* eslint-disable no-console */
// Vitest setup for the app unit suite - replaces the former Mocha
// test/unit/helpers/init.js and the require.extensions / Module._load
// monkeypatching in test/unit/helpers/babel-register.js (now handled by
// config/vitest.config.js: the css-module stub plugin, the jsdom environment,
// and the @hsl-fi/* aliases).
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Link from 'found/Link';
import { Settings } from 'luxon';
import { cleanup } from '@testing-library/react';
import { beforeEach, afterEach, vi } from 'vitest';
import * as ReactRelay from 'react-relay';
import { initAnalyticsClientSide } from '../../../app/util/analyticsUtils';
import {
  restoreOwnedIntlStub,
  restoreOwnedContextStubs,
} from './mock-intl-enzyme';

// set up timezone / locale in luxon
Settings.defaultZone = 'Europe/Helsinki';
Settings.defaultLocale = 'fi';

Object.defineProperty(window.navigator, 'userAgent', {
  value: 'node.js',
  configurable: true,
});

// For Google Tag Manager
initAnalyticsClientSide({ useCookiesPrompt: false });

const MockLink = ({ children }) => children;

// Deprecation warnings from unmaintained deps (not app bugs) that the old
// suite never surfaced because those components weren't reached.
const IGNORED_WARNINGS = [
  'getDefaultProps is only used on classic React.createClass',
  // React's follow-up component-stack log after an error it already
  // reported (and which already failed its test on the first call).
  'The above error occurred in the',
];

configure({ adapter: new Adapter() });

// `restoreMocks: true` (config/vitest.config.js) restores every spy before
// each test, so these suite-wide spies are re-installed per test rather than
// once in a `beforeAll`.
beforeEach(() => {
  // Turn any React warning into a test failure (matches the old suite).
  vi.spyOn(console, 'error').mockImplementation(warning => {
    const message = typeof warning === 'string' ? warning : String(warning);
    if (IGNORED_WARNINGS.some(w => message.includes(w))) {
      return;
    }
    throw new Error(warning);
  });
  vi.spyOn(Link, 'render').mockImplementation(MockLink);
  // Components render fully-masked fragment data as props; make useFragment a
  // pass-through (the old suite stubbed react-relay the same way).
  vi.spyOn(ReactRelay, 'useFragment').mockImplementation((_query, ref) => ref);
});

afterEach(() => {
  cleanup();
  restoreOwnedIntlStub();
  restoreOwnedContextStubs();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
