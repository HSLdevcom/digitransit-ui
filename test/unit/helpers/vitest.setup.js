/* eslint-disable no-console */
// Vitest setup for the app unit suite (replaces the former Mocha
// test/unit/helpers/init.js, now removed). jsdom's own `environment: 'jsdom'`
// (config/vitest.app.config.js) already provides window/document/navigator/
// localStorage/sessionStorage globally, so this file doesn't need to
// construct a JSDOM instance or copy its properties onto `global` by hand.
import Link from 'found/Link';
import relay from 'react-relay';
import { Settings } from 'luxon';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
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
// root element `server/serve.js` renders the app into.
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
// (config/vitest.app.config.js) restores every vi mock before each test,
// which would undo a vi-based stub here after the very first test.
const originalConsoleError = console.error;
const originalLinkRender = Link.render;
const originalUseFragment = relay.useFragment;

beforeAll(() => {
  console.error = warning => {
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
  // `restoreMocks: true` (config/vitest.app.config.js) only restores
  // vi.fn()/vi.spyOn() mocks right before the *next* test starts, so a
  // test-scoped mock (e.g. one replacing the window.localStorage getter)
  // is still active here otherwise, breaking this cleanup itself.
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
