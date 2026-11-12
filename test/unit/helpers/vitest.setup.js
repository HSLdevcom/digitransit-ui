/* eslint-disable no-console */
// Vitest setup for the app unit suite (replaces the former Mocha
// test/unit/helpers/init.js, now removed). jsdom's own `environment: 'jsdom'`
// (vitest.config.js's `app` project) already provides window/document/navigator/
// localStorage/sessionStorage globally, so this file doesn't need to
// construct a JSDOM instance or copy its properties onto `global` by hand.
import { cleanup } from '@testing-library/react';
import Link from 'found/Link';
import axios from 'axios';
import { Settings } from 'luxon';
import ReactModal from 'react-modal';
import { initAnalyticsClientSide } from '../../../utils/shared/analyticsUtils';
import { relayMock, withRelayStubs } from './mock-relay';

// Relay is stubbed here once, for both entry points, so components get the
// same hooks whichever one they import from. The stubs read their behaviour
// from `relayMock` (see mock-relay.js), which tests configure instead of
// mocking anything themselves. Module mocks belong here rather than in test
// files: test files share one module registry per worker (vitest.config.js
// `isolate: false`), so a mock must be the same for every file (see
// docs/Tests.md).
vi.mock('react-relay', async importOriginal =>
  withRelayStubs(await importOriginal()),
);
vi.mock('react-relay/hooks', async importOriginal =>
  withRelayStubs(await importOriginal()),
);

// getJson uses axios, which would use jsdom's XMLHttpRequest by default.
// Route it through fetch so tests can keep mocking fetch.
axios.defaults.adapter = 'fetch';

// jsdom has no layout, so react-truncate-markup would cut the text.
vi.mock('react-truncate-markup', () => ({
  default: ({ children }) => children,
}));

// set up timezone in luxon; restored after every test (see afterEach below)
const luxonDefaults = { zone: 'Europe/Helsinki', locale: 'fi' };
Settings.defaultZone = luxonDefaults.zone;
Settings.defaultLocale = luxonDefaults.locale;

Object.defineProperty(window.navigator, 'userAgent', {
  value: 'node.js',
  configurable: true,
});

// react-modal (used internally by @hsl-fi/modal, rendered for real now that
// the old Mocha suite's @hsl-fi/* stubbing hack has been dropped - see
// docs/Tests.md) requires an `appElement`/`#app` DOM node to exist for its
// aria-hidden accessibility handling, mirroring the real `<div id="app">`
// root element `server/middleware/shell.js` renders the app into. The test
// files of a worker share one document, so the element is created once.
let appRoot = document.getElementById('app');
if (!appRoot) {
  appRoot = document.createElement('div');
  appRoot.id = 'app';
  document.body.appendChild(appRoot);
}

const config = {
  useCookiesPrompt: false,
};
// For Google Tag Manager
initAnalyticsClientSide(config);

const MockLink = ({ children }) => children;

// These overrides last for a whole test file (not per-test mocks), so they're
// done via plain property reassignment rather than vi.spyOn() - spies are
// restored after every test (see afterEach below), which would undo a
// vi-based stub here after the very first test.
const originalConsoleError = console.error;
const originalLinkRender = Link.render;

// React 18 bump (React 18 upgrade plan, Phase 1): these two deprecation
// warnings now surface here because @testing-library/react's `render` uses
// `createRoot`, which reports them via `onRecoverableError`/console.error
// where React 16's legacy root didn't. Both are pre-existing, known,
// deliberately-deferred cleanup (legacy contextTypes/getChildContext and
// function-component defaultProps - see Phase 4 of the React 18 upgrade plan),
// not new bugs introduced by the bump, so they're allow-listed here instead
// of escalated to a thrown error like every other warning.
const allowedDeprecationWarnings = [
  'uses the legacy childContextTypes API',
  'uses the legacy contextTypes API',
  'Support for defaultProps will be removed from',
  // fluxible-addons-react's connectToStores.js uses a string ref internally;
  // we can't fix third-party code, and it's moot once Fluxible is removed.
  'contains the string ref',
];

beforeAll(() => {
  ReactModal.setAppElement(appRoot);
  console.error = warning => {
    const message = String(warning);
    if (allowedDeprecationWarnings.some(allowed => message.includes(allowed))) {
      return;
    }
    throw new Error(warning);
  };
  Link.render = MockLink;
  // TODO this could be renabled when dependencies don't throw warnings
  // console.warn = callback;
});

afterAll(() => {
  console.error = originalConsoleError;
  Link.render = originalLinkRender;
});

// Resets what a test may have changed, as the test files of a worker share
// one environment (vitest.config.js `isolate: false`).
afterEach(() => {
  cleanup();
  // react-modal hides its app element (#app, or body in some tests) and only
  // restores it after closeTimeoutMS; a leftover aria-hidden would make later
  // getByRole queries fail.
  appRoot.removeAttribute('aria-hidden');
  document.body.removeAttribute('aria-hidden');
  // The `restoreMocks` config option only restores spies right before the
  // *next* test starts, so a test-scoped spy (e.g. one replacing the
  // window.localStorage getter) would still be active here, breaking this
  // cleanup itself. Undoing spies, stubbed globals and fake timers here also
  // keeps them from leaking into the next test file's setup.
  vi.restoreAllMocks();
  relayMock.reset();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  Settings.defaultZone = luxonDefaults.zone;
  Settings.defaultLocale = luxonDefaults.locale;
  Settings.now = () => Date.now();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
