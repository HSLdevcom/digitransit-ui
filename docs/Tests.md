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
runner (`vitest.config.js`'s `app` project) with globals enabled, so `describe`/
`it`/`expect`/`vi` are available without imports (imports are still used
throughout the suite for clarity/lint compliance). The pattern being watched
is `'test/unit/**/*.test.{js,jsx}'`. Assertions use Vitest's native `expect` API and
mocking uses `vi.fn()`/`vi.spyOn()` — there is no dependency on
mocha/chai/sinon.

Using yarn

```sh
yarn run test-unit
```

Run a single test file (any part of its path) or tests by describe/it name

```sh
yarn test-unit:app <path-substring>
yarn test-unit:app -t "<name-pattern>"
```

Using the continuous watch mode

```sh
yarn run test-unit -- --watch
```
