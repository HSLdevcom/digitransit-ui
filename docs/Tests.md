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

Unit tests can be run locally. This uses the [Vitest](https://vitest.dev) test
runner. The main app suite is the `app` project in the shared
`config/vitest.config.js`, matching `'test/unit/**/*.test.js'`; the
workspace-package suites are the other projects in the same config and run via
`yarn workspace-packages-test` (which passes `--project '!app'`).

Using yarn

```sh
yarn run test-unit
```

Run just the app suite

```sh
yarn run test-unit:app
```

Run a single test by name (matches `describe`/`it` text)

```sh
yarn run test-single -t <pattern>
```

Using the continuous watch mode

```sh
yarn run test-unit:app --watch
```
