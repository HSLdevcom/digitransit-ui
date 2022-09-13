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

Unit tests can be run locally. This currently uses the `mocha` test runner. The pattern being watched is `'test/unit/**/*.test.js'`.

Using yarn

```sh
yarn run test-unit
```

Run a single test using yarn

```sh
yarn run test-unit -g <name of the tested file without .test.js>
```

Using the continuous watch mode

```sh
yarn run test-unit -- --watch
```

Generate code coverage report

```sh
yarn run test-coverage
```

Report is generated using nyc/Istanbul (config file `.nycrc.json`). HTML report is generated into `coverage` directory.
