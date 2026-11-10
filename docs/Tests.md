# Testing

## Browser automation for AI agents (Playwright MCP)

`.mcp.json` registers a pinned `@playwright/mcp` server (run via `npx`, not a project dependency) that lets AI agents such as Copilot CLI browse the app. It is for interactive exploration, not a test runner.

### Setup

1. Install Google Chrome: `npx -p @playwright/mcp@0.0.84 playwright install chrome` (needs sudo on Linux) or from google.com/chrome.
2. Start `copilot` from the repository root and accept the folder trust prompt (project MCP servers load only in trusted folders). Check with `/mcp`.
   If the server doesn't show up, register it for your user: `copilot mcp add playwright -- npx @playwright/mcp@0.0.84 --browser chrome --headless`.
3. Start the app with `yarn run dev` and let the agent open http://localhost:8080.

Other agents: use their own MCP configuration with the same command and arguments. Bump the pinned version in `.mcp.json` by hand.

## Unit tests

Unit tests can be run locally. This uses the [Vitest](https://vitest.dev/) test
runner (`vitest.config.js`'s `app` project, plus a `server` project that runs
`test/unit/server/**` and `test/unit/utils/server/**` in a plain Node environment
instead of jsdom) with globals enabled, so `describe`/
`it`/`expect`/`vi` are available without imports (imports are still used
throughout the suite for clarity/lint compliance). The pattern being watched
is `'test/unit/**/*.test.{js,jsx}'`. Assertions use Vitest's native `expect` API and
mocking uses `vi.fn()`/`vi.spyOn()`/`vi.mock()`. Set environment variables with `vi.stubEnv()`
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

### Accessibility tests

Component tests can also check the rendered DOM with [axe-core](https://github.com/dequelabs/axe-core)
through `expectNoA11yViolations` from the private `@digitransit-ui/test-utils`
package (`packages/private/test-utils`). It runs the
WCAG 2.x A/AA and axe best-practice rules on `document.body` (so portals such
as modals are included) and fails on any violation:

```jsx
import { expectNoA11yViolations } from '@digitransit-ui/test-utils';

it('has no accessibility violations', async () => {
  renderWithProviders(<MyComponent />);
  await expectNoA11yViolations();
});
```

Fix the markup where possible. For a known issue that cannot be fixed yet, pass
an allow entry. The `rule` must be an axe rule id and the `reason` is required.
`selector` limits the entry to nodes inside matching elements (also across
shadow roots), and an entry that matches nothing fails the test so the list
cannot go stale:

```js
await expectNoA11yViolations(document.body, {
  allow: [{ rule: 'button-name', selector: '.legacy', reason: 'See #1234' }],
});
```

jsdom has no layout or canvas, so the helper disables the rules that need them
(`color-contrast`, `label-content-name-mismatch`, `target-size`), as well as
`region`, because rendered components are not inside page landmarks. Contrast,
target size, focus order and full-page structure still need manual checks or a
browser-based test. Static JSX checks come from
`eslint-plugin-jsx-a11y` in `yarn lint`.

Components from `packages/digitransit-component` are resolved from their built
`lib/` in app tests, so run `yarn packages-build` after changing them (as
`yarn test-unit` does).

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

For tests focused on content and callbacks, mock the wrapper as in
[NavigatorIntroModal.test.jsx](../test/unit/component/itinerary/navigator/navigatorintro/NavigatorIntroModal.test.jsx):

```jsx
vi.mock('@hsl-fi/modal', () => ({
  // eslint-disable-next-line react/prop-types
  default: ({ isOpen, children }) => (isOpen ? children : null),
}));
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

The `#app` element must already exist. Resolving from the package avoids
hardcoding a nested `node_modules` path and handles both nested and hoisted
installations. This workaround was confirmed to pass the two navigator intro
tests, but was replaced with the focused mock to avoid coupling shared setup
to a dependency's internal dependency. Do not disable ARIA hiding merely to
suppress the warning. The upstream fix is to supply the app element to the
underlying modal before its portal mounts.
