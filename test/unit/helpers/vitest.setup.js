/* eslint-disable no-console */
// Vitest setup for the app unit suite (replaces the former Mocha
// test/unit/helpers/init.js, now removed). jsdom's own `environment: 'jsdom'`
// (vitest.config.js's `app` project) already provides window/document/navigator/
// localStorage/sessionStorage globally, so this file doesn't need to
// construct a JSDOM instance or copy its properties onto `global` by hand.
import Link from 'found/Link';
import relay from 'react-relay';
import { Settings } from 'luxon';
import { cleanup } from '@testing-library/react';
import { initAnalyticsClientSide } from '../../../utils/shared/analyticsUtils';

// set up timezone in luxon
Settings.defaultZone = 'Europe/Helsinki';
Settings.defaultLocale = 'fi';

Object.defineProperty(window.navigator, 'userAgent', {
  value: 'node.js',
  configurable: true,
});

// react-modal (used internally by @hsl-fi/modal, rendered for real now that
// the old Mocha suite's @hsl-fi/* stubbing hack has been dropped - see
// docs/Tests.md) requires an `appElement`/`#app` DOM node to exist for its
// aria-hidden accessibility handling, mirroring the real `<div id="app">`
// root element `server/middleware/shell.js` renders the app into.
const appRoot = document.createElement('div');
appRoot.id = 'app';
document.body.appendChild(appRoot);

const config = {
  useCookiesPrompt: false,
};
// For Google Tag Manager
initAnalyticsClientSide(config);

const MockLink = ({ children }) => children;

// These are process-wide overrides applied once for the whole run (not
// per-test mocks), so they're done via plain property reassignment rather
// than vi.fn()/vi.spyOn() - the `restoreMocks: true` Vitest config option
// (vitest.config.js's `app` project) restores every vi mock before each test,
// which would undo a vi-based stub here after the very first test.
const originalConsoleError = console.error;
const originalLinkRender = Link.render;
const originalUseFragment = relay.useFragment;

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
  console.error = warning => {
    const message = String(warning);
    if (allowedDeprecationWarnings.some(allowed => message.includes(allowed))) {
      return;
    }
    throw new Error(warning);
  };
  Link.render = MockLink;
  // stub useFragment hook to return referenced object
  // this assumes that a component is given complete data as props
  relay.useFragment = (query, ref) => ref;
  // TODO this could be renabled when dependencies don't throw warnings
  // console.warn = callback;
});

afterAll(() => {
  console.error = originalConsoleError;
  Link.render = originalLinkRender;
  relay.useFragment = originalUseFragment;
});

// make sure the local and session storage stays clear for each test
afterEach(() => {
  cleanup();
  // `restoreMocks: true` (vitest.config.js's `app` project) only restores
  // vi.fn()/vi.spyOn() mocks right before the *next* test starts, so a
  // test-scoped mock (e.g. one replacing the window.localStorage getter)
  // is still active here otherwise, breaking this cleanup itself.
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
