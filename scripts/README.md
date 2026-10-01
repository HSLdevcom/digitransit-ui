# Scripts

## Using `sort-translations.js`

This script sorts translation files in the [`app/translations`](/app/translations) directory.
See the `sort-translations` and `format` scripts in [`package.json`](/package.json).

## `dev.sh` API options

`scripts/dev.sh` (run via `yarn run dev`) reads env vars to pick which API/config to run against.
See the `themeMap` in `server/configs/config.default.js` for `CONFIG` options.

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

## Using `build/contextHelper.js`

A pure build helper, imported directly (not run standalone):
[`contextHelper.js`](/scripts/build/contextHelper.js) is used by
[`webpack.config.js`](/webpack.config.js) to compute webpack theme entries
and favicon plugins for every configured deployment (or just `$CONFIG` if set).

## Using `build/copyStatic.js`

Populates the served `_static/` directory from `static/`, run via `yarn static` (which both
`prebuild` and `dev.sh` invoke):

```
yarn static
```

It copies every config's assets regardless of `$CONFIG` (a deployment with no `$CONFIG` set
picks its config per request from the `Host` header, and `ASSEMBLE_GEOJSON` deployments
reference every region's zone layer), minifies `.geojson` files and writes precompressed
`.gz`/`.br` siblings for them. Deliberately kept outside webpack so it survives a bundler
migration; note that `_static` is populated once at startup, so `static/` edits during
`yarn dev` need a re-run. See [`docs/Webpack.md`](/docs/Webpack.md).

## Using `build/buildSprites.js`

Builds the SVG sprite sheets `_static/assets/svg-sprite.<theme>.svg` from the per-icon files in
[`app/assets/icons/`](/app/assets/icons), run via `yarn sprites` (which both `prebuild` and
`dev.sh` invoke):

```
yarn sprites
yarn sprites --watch
```

`default/` holds every icon and other theme directories hold only their overrides and additions;
each file's name becomes its symbol id. A malformed icon file fails the build. `--watch` (used by
`dev.sh`) rebuilds on every change under `app/assets/icons/` and only logs errors, so a
half-saved file doesn't stop `yarn dev`. See [`docs/Webpack.md`](/docs/Webpack.md).

## Using `theme/add-theme.js`

Scaffolds a new theme: creates `sass/themes/<name>`, a config file at
`server/configs/config.<name>.js` (from `theme/template.waltti.js`), and registers the theme
in `config.default.js`'s host-name mapping. See [`docs/Themes.md`](/docs/Themes.md).

```
yarn add-theme <name> '#RRGGBB' <optional navbar logo>
```

## Using `workspace-packages/check-versions.js`

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
BASE_SHA=<git ref> yarn workspace-packages-version-check
```

## Using `workspace-packages/generate-readmes.js`

Regenerates a workspace package's `README.md` from its JSDoc via
[`documentation.js`](https://documentation.js.org/). Needs no family/package argument: run from
inside a package's directory to regenerate just that one, or from anywhere else (e.g. the
repository root) to regenerate every package in every family. See the `workspace-packages-docs`
script in [`package.json`](/package.json). Never hand-edit a generated `README.md` — fix the
source JSDoc and regenerate instead.

```
node scripts/workspace-packages/generate-readmes.js
```

## Using `workspace-packages/sort-translations.js`

Sorts and checks `digitransit-component` packages' own translation bundles
(`src/{helpers,utils}/translations.js`) — a different shape from `app/translations`, so
separate from the `sort-translations.js` script above. Flags any key missing from a `fi`/`sv`/`en`
locale. See the `workspace-packages-translations-check`/`-fix` scripts in
[`package.json`](/package.json).

## Using `generate-schema.js`

Regenerates `schema/schema.graphql` (the GraphQL schema used by relay-compiler and
graphql-eslint) from the OTP repo. `digitransit-search-util-query-utils` references this same
file via a relative path (`../../../schema/schema.graphql`) rather than keeping its own copy.

```
node scripts/generate-schema.js
```

Use `SCHEMA_SRC=<url-or-local-path>` to fetch/copy from a non-default location, e.g. from a
local OTP clone:
```
SCHEMA_SRC=~/OpenTripPlanner/application/src/main/resources/org/opentripplanner/apis/gtfs/schema.graphqls node scripts/generate-schema.js
```

