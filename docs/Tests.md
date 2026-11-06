# Testing

## E2E-tests

E2E-tests are run with hsl, tampere and matka configs on github actions. Desktop and mobile have individual tests.

- First build the UI: `yarn build`

### Running tests

- Running tests for desktop: `CONFIG=hsl yarn test:e2e`
- Running tests for mobile: `MOBILE=TRUE CONFIG=hsl yarn test:e2e`
- Running single visual test, for example tests for FrontPage: `CONFIG=hsl yarn test:e2e -- FrontPage`

### Updating snapshots

- Updating desktop snapshots for single config: `CONFIG=hsl yarn test:update-snapshots`
- Update desktop snapshots for all configs: `yarn test:update-all-desktop-snapshots`
- Updating mobile snapshots for single config: `MOBILE=TRUE CONFIG=hsl yarn test:update-snapshots`
- Update mobile snapshots for all configs: `yarn test:update-all-mobile-snapshots`
- Update all snapshots for all config and for both desktop and mobile: `yarn test:update-all-snapshots`

## Unit tests

Unit tests can be run locally. This uses the [Vitest](https://vitest.dev/) test
runner (`vitest.config.js`'s `app` project, plus a `server` project that runs
`test/unit/server/**` and `test/unit/utils/server/**` in a plain Node environment
instead of jsdom) with globals enabled, so `describe`/
`it`/`expect`/`vi` are available without imports (imports are still used
throughout the suite for clarity/lint compliance). The pattern being watched
is `'test/unit/**/*.test.{js,jsx}'`. Assertions use Vitest's native `expect` API and
mocking uses `vi.fn()`/`vi.spyOn()` (`vi.mock()` only in the server tests and the app
setup file, see [Shared environment of the app tests](#shared-environment-of-the-app-tests)).
Set environment variables with `vi.stubEnv()`
(undone by `vi.unstubAllEnvs()`) rather than assigning to `process.env`, which can't restore an
originally unset variable.

Using yarn

```sh
yarn run test-unit
```

Run only the app or only the server tests (`test/unit/server/**` and
`test/unit/utils/server/**`)

```sh
yarn test-unit:app
yarn test-unit:server
```

Run a single test file (any part of its path) or tests by describe/it name. Use
`test-unit:server` instead for server tests.

```sh
yarn test-unit:app <path-substring>
yarn test-unit:app -t "<name-pattern>"
```

Using the continuous watch mode

```sh
yarn run test-unit -- --watch
```

### Shared environment of the app tests

The `app` project runs with `isolate: false`: the test files of a worker share one
jsdom environment and one module registry instead of recreating them for every
file, which makes the suite several times faster. The other projects keep
Vitest's default isolation. A test must therefore leave nothing behind that a
later file could see. After every test, `test/unit/helpers/vitest.setup.js`
unmounts rendered components, restores spies, stubbed globals and real timers,
and clears `localStorage`/`sessionStorage`. Beyond that:

- Stub `window` properties with `vi.stubGlobal()` rather than assigning to them.
- Undo other changes to shared objects, e.g. remove `fetch-mock` routes and call
  history after each test, and don't leave requests or timers running after a
  test has ended.
- Don't call `vi.mock()` in a test file (enforced by ESLint). A module mock
  applies to one file, while each module is evaluated only once per worker: the
  mock misses modules that an earlier file already imported, and leaks into
  later files through the modules imported while it was active. Instead, stub
  the export with `vi.spyOn()` on the module namespace in `beforeEach`. Modules
  that read the export when they run (render, call) see the stub, which is
  restored after each test; one that captures the export when it loads (e.g. by
  wrapping it in `memo()`) doesn't. Only exports of modules that Vitest
  transforms can be stubbed (Vitest throws for externalized ones):

  ```jsx
  import * as timeUtils from '../../../utils/client/timeUtils';
  import * as DepartureRowModule from '../../../app/component/DepartureRow';

  const DepartureRowStub = () => <tr />;

  beforeEach(() => {
    vi.spyOn(timeUtils, 'unixTime').mockReturnValue(1700000000);
    // a component is replaced through the getter of its export
    vi.spyOn(DepartureRowModule, 'default', 'get').mockReturnValue(
      DepartureRowStub,
    );
  });
  ```

  Relay is the exception to the `vi.spyOn()` rule: `vitest.setup.js` stubs
  `react-relay` and `react-relay/hooks` once, and a test configures the stubs
  through `relayMock` from `test/unit/helpers/mock-relay.js`, never with its own
  mock or spy. `useFragment` returns the data it is given, so pass resolved data
  as the fragment prop. Queries are matched by query node or name, or by `null`
  for all queries; the registrations and recorded calls are cleared after each
  test:

  ```jsx
  import { relayMock } from '../helpers/mock-relay';

  relayMock.query(TripLinkQuery, { trip }); // useLazyLoadQuery result
  relayMock.query(null, relayMock.pending); // suspends every query
  relayMock.fetch(null, response); // fetchQuery(...).toPromise() resolves to it
  relayMock.fetch(null, variables => promise); // the test resolves it itself
  expect(relayMock.fetchCalls).toHaveLength(1); // { query, variables, options }
  ```

  Without a registration `useLazyLoadQuery` returns `{}` and `fetchQuery` never
  resolves. A module mock that every other test file needs also belongs in
  `vitest.setup.js`.

If a test passes alone but fails in the full run, another file has likely left
state behind. This runs all files in one worker in a reproducible random order:

```sh
yarn test-unit:app --maxWorkers=1 --sequence.shuffle.files --sequence.seed=<n>
```

### Troubleshooting: HSL modal app element warning

Opening `@hsl-fi/modal` can fail with:

```text
react-modal: App element is not defined. Please use `Modal.setAppElement(el)` or set `appElement={el}`.
```

The app test setup turns `console.error` into an exception, so this warning
fails the test. With `@hsl-fi/modal` 0.3.2, two details cause this:

- The package can resolve a separate installed copy of `react-modal`. Calling
  `setAppElement` on the app's imported copy does not configure that copy:
  each instance maintains its own app-element state.
- The HSL wrapper consumes its `appElement` prop and calls the underlying
  `setAppElement` in `useEffect`, rather than forwarding the prop. An initially
  open modal mounts its portal before that effect runs. A later test may pass
  because the effect has since initialized the shared instance.

Importing `Modal` from `@hsl-fi/modal` does not expose `setAppElement`: it exports
a wrapper component, not the underlying `react-modal` component or its static
methods. Creating a `#app` element alone therefore does not resolve this issue.

For tests focused on content and callbacks, stub the wrapper as in
[NavigatorIntroModal.test.jsx](../test/unit/component/itinerary/navigator/navigatorintro/NavigatorIntroModal.test.jsx):

```jsx
import * as HslModalModule from '@hsl-fi/modal';

// eslint-disable-next-line react/prop-types
const ModalStub = ({ isOpen, children }) => (isOpen ? children : null);

beforeEach(() => {
  vi.spyOn(HslModalModule, 'default', 'get').mockReturnValue(ModalStub);
});
```

This preserves the content under test without exercising third-party portals
or initialization timing. It does not test modal accessibility, focus handling,
or dismissal behavior.

If a test needs the real modal, Node's `createRequire` can load the exact
`react-modal` instance resolved from the HSL package and initialize it before
rendering:

```js
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const requireHslModal = createRequire(require.resolve('@hsl-fi/modal'));
const HslReactModal = requireHslModal('react-modal');

beforeAll(() => {
  HslReactModal.setAppElement(document.querySelector('#app'));
});
```

The setup file attaches the `#app` element in its own `beforeAll` hook, so
query it from a hook rather than at the top level of a test file. Resolving
from the package avoids hardcoding a nested `node_modules` path and handles
both nested and hoisted installations. This workaround was confirmed to pass
the two navigator intro tests, but was replaced with the focused stub to avoid
coupling shared setup to a dependency's internal dependency. Do not disable
ARIA hiding merely to suppress the warning. The upstream fix is to supply the
app element to the underlying modal before its portal mounts.
