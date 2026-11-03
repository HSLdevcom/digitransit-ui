/* eslint-disable no-console */
// Vitest setup for the app unit suite (replaces the former Mocha
// test/unit/helpers/init.js, now removed). jsdom's own `environment: 'jsdom'`
// (vitest.config.js's `app` project) already provides window/document/navigator/
// localStorage/sessionStorage globally, so this file doesn't need to
// construct a JSDOM instance or copy its properties onto `global` by hand.
import { cleanup } from '@testing-library/react';
import Link from 'found/Link';
import { Settings } from 'luxon';
import ReactModal from 'react-modal';
import relayHooks from 'react-relay/hooks';
import { initAnalyticsClientSide } from '../../../utils/shared/analyticsUtils';

// Stub useFragment/useRefetchableFragment globally so components can be
// tested by passing in complete, already-resolved data as props instead of
// a real Relay fragment reference/store. This has to be done via vi.mock
// (which replaces the module itself) rather than reassigning a property on
// the default export - `import { useFragment } from 'react-relay'` (used
// throughout app/component/**) gets a snapshot of the named export under
// Vite/Vitest's CJS interop, so it doesn't see a later
// `relay.useFragment = ...` reassignment; only
// `import relay from 'react-relay'; relay.useFragment` call sites would.
// vi.mock avoids that distinction since both import forms resolve to the
// same mocked module. useRefetchableFragment's refetch function is a no-op.
// Module mocks belong here rather than in test files: test files share one
// module registry per worker (vitest.config.js `isolate: false`), so a mock
// must be the same for every file (see docs/Tests.md).
vi.mock('react-relay', async importOriginal => {
  const actual = await importOriginal();
  const relay = actual.default;
  return {
    ...actual,
    ...relay,
    useFragment: (_fragment, fragmentRef) => fragmentRef,
    useRefetchableFragment: (_fragment, fragmentRef) => [fragmentRef, vi.fn()],
    // Every test file gets a new instance of this mock, but modules imported
    // by an earlier file keep theirs. Reading fetchQuery from react-relay's
    // own exports object (the default export) at call time lets
    // `vi.spyOn(relay, 'fetchQuery')` reach every caller regardless.
    fetchQuery: (...args) => relay.fetchQuery(...args),
  };
});

// jsdom has no layout, so react-truncate-markup would cut the text.
vi.mock('react-truncate-markup', () => ({
  default: ({ children }) => children,
}));

// Stub useLazyLoadQuery globally for the same reason, defaulting to an empty
// result so standalone-query components (TripLink, FuzzyTripLink, and the
// trafficnow/ components) render their "no data yet" state without needing a
// real Relay environment/network response. This is done via vi.spyOn in a
// beforeEach below (run after Vitest's own `restoreMocks` autouse hook
// resets it) rather than vi.mock like useFragment/useRefetchableFragment
// above: components call useLazyLoadQuery via a direct
// `import { useLazyLoadQuery } from 'react-relay/hooks'` (the existing
// trafficnow/ convention) and tests needing a resolved-data branch already
// override it with their own `vi.spyOn(relayHooks, 'useLazyLoadQuery')...`
// call (see test/unit/component/trafficnow/TrafficNow.test.jsx) - a
// competing vi.mock of the same specifier interferes with that spy's
// visibility to the component's own named import.
beforeEach(() => {
  vi.spyOn(relayHooks, 'useLazyLoadQuery').mockReturnValue({});
});

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
// root element `server/middleware/shell.js` renders the app into. It's attached
// for one test file at a time, as the files of a worker share one document.
const appRoot = document.createElement('div');
appRoot.id = 'app';

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
  document.body.appendChild(appRoot);
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
  appRoot.remove();
  console.error = originalConsoleError;
  Link.render = originalLinkRender;
});

// Resets what a test may have changed, as the test files of a worker share
// one environment (vitest.config.js `isolate: false`).
afterEach(() => {
  cleanup();
  // react-modal hides its app element (body in some tests) and only restores
  // it after closeTimeoutMS; a leftover aria-hidden would make later
  // getByRole queries fail.
  document.body.removeAttribute('aria-hidden');
  // The `restoreMocks` config option only restores spies right before the
  // *next* test starts, so a test-scoped spy (e.g. one replacing the
  // window.localStorage getter) would still be active here, breaking this
  // cleanup itself. Undoing spies, stubbed globals and fake timers here also
  // keeps them from leaking into the next test file's setup.
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
