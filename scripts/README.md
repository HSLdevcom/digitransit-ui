# Scripts

## Using `sort-translations.js`

This script sorts translation files in the [`app/translations`](/app/translations) directory.
See the `sort-translations` and `format` scripts in [`package.json`](/package.json).

## `dev.sh` API options

`scripts/dev.sh` (run via `yarn run dev`) reads env vars to pick which API/config to run against.
See the `themeMap` in `app/configurations/config.default.js` for `CONFIG` options.

- `CONFIG` — deployment config to use, e.g. `hsl`, `matka` (default: `default`).
- `API_TYPE` — `development` (default, `dev-api.digitransit.fi`), `production`
  (`api.digitransit.fi`), or `local` (OTP at `http://localhost:9080/otp/`).
- `API_SUBSCRIPTION_TOKEN` — subscription key for map tiles/geocoding/etc.

### Usage examples

Using the UI with the development API:
```
CONFIG=hsl API_TYPE=development API_SUBSCRIPTION_TOKEN=<your_subscription_key> yarn run dev
```
Using the UI with the production API:
```
CONFIG=hsl API_TYPE=production API_SUBSCRIPTION_TOKEN=<your_subscription_key> yarn run dev
```
Using the UI with a local instance of OTP on port `9080` (still needs a dev subscription key for
map tiles and similar features):
```
CONFIG=matka API_TYPE=local API_SUBSCRIPTION_TOKEN=<your_subscription_key> yarn run dev
```

## Using `build/contextHelper.js` and `build/assetUrlPlaceholder.js`

Both are pure build/server-side helpers, required directly (not run standalone):

- [`contextHelper.js`](/scripts/build/contextHelper.js) — used by
  [`webpack.config.babel.js`](/webpack.config.babel.js) to compute webpack theme entries
  and favicon plugins for every configured deployment (or just `$CONFIG` if set).
- [`assetUrlPlaceholder.js`](/scripts/build/assetUrlPlaceholder.js) — exports the
  placeholder token baked into the service worker's precache manifest at build time
  (`webpack.config.babel.js`) and substituted with the real `ASSET_URL` at request time
  (`server/server.js`).

## Using `theme/add-theme.js`

Scaffolds a new theme: creates `sass/themes/<name>`, a config file at
`app/configurations/config.<name>.js` (from `theme/template.waltti.js`), and registers the theme
in `config.default.js`'s host-name mapping. See [`docs/Themes.md`](/docs/Themes.md).

```
yarn add-theme <name> '#RRGGBB' <optional navbar logo>
```

## Using `check-versions-workspaces.js`

Runs two checks against the workspace packages (`digitransit-component`,
`digitransit-search-util`, `digitransit-store`, `digitransit-util`); both are enforced in CI on
pull requests.

1. **Internal reference protocol.** Every `@digitransit-*` `dependencies`/`peerDependencies`
   entry that points at another workspace package must be declared as exactly `"workspace:^"`.
   `lerna version` only rewrites/cascades an internal cross-reference (and `yarn` only links the
   local copy instead of pulling a stale published one) when it uses the `workspace:` protocol; a
   plain semver pin is silently left behind on version bumps. `lerna publish` resolves
   `"workspace:^"` to `"^<version>"` in the published tarball, so consumers outside the monorepo
   are unaffected. This check always runs, regardless of `BASE_SHA`.

2. **Version bumps.** Fails if a workspace package changed since a given base commit but its
   `package.json` `version` wasn't bumped accordingly (or was bumped in the wrong direction).
   `lerna publish from-package` only republishes a package when its committed version is greater
   than what's already on npm, so a changed-but-unbumped package would otherwise silently never
   get published. This check runs only when `BASE_SHA` is set. Run `yarn bump-versions-workspaces`
   (`lerna version`) to bump the changed packages and cascade bumps to their dependents.

```
BASE_SHA=<git ref> yarn check-versions-workspaces
```

## Using `generate-schema.js`

Regenerates `schema/schema.graphql` (the GraphQL schema used by relay-compiler and
graphql-eslint) from the OTP repo, and copies it into
`digitransit-search-util-query-utils`.

```
node scripts/generate-schema.js
```

Use `SCHEMA_SRC=<url-or-local-path>` to fetch/copy from a non-default location, e.g. from a
local OTP clone:
```
SCHEMA_SRC=~/OpenTripPlanner/application/src/main/resources/org/opentripplanner/apis/gtfs/schema.graphqls node scripts/generate-schema.js
```

