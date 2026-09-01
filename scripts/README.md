# Scripts

## Using `sort-translations.js`

This script sorts translation files in the [`app/translations`](/app/translations) directory.
See the `sort-translations` and `format` scripts in [`package.json`](/package.json).

## Using `ui.sh`

See the `themeMap` in `app/configurations/config.default.js` for configuration options.

### Before using
```
source ui.sh
```
### Usage examples

Using the UI with the development API:
```
DEV_SUBSCRIPTION_KEY=<your_subscription_key> uidev hsl
```
Using the UI with the production API:
```
SUBSCRIPTION_KEY=<your_subscription_key> uiprod hsl
```
Using the UI with a local instance of OTP on port `9080`:
```
DEV_SUBSCRIPTION_KEY=<your_subscription_key> uilocal matka
```
In case you do not need features usable with a subscription key when running a local instance of OTP on port `9080`:
```
NO_SUBSCRIPTION_KEY=true uilocal matka
```

## Using `contextHelper.js`

Used by [`webpack.config.babel.js`](/webpack.config.babel.js) to compute webpack theme entries
and favicon plugins for every configured deployment (or just `$CONFIG` if set). Not run directly.

## Using `theme/add-theme.js`

Scaffolds a new theme: creates `sass/themes/<name>`, a config file at
`app/configurations/config.<name>.js` (from `theme/template.waltti.js`), and registers the theme
in `config.default.js`'s host-name mapping. See [`docs/Themes.md`](/docs/Themes.md).

```
yarn add-theme <name> '#RRGGBB' <optional navbar logo>
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

