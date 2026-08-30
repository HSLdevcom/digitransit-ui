# Scripts

## Using `sort-translations.js`

This script sorts translation files in the [`app/translations`](/app/translations) directory.
See the `sort-translations` and `format` scripts in [`package.json`](/package.json).

## Build pipeline scripts

Run by the `prebuild` / `build` scripts in [`package.json`](/package.json):

- **`viteBuildInputs.js`** – plain CJS module `require`d by [`vite.config.mjs`](/vite.config.mjs);
  derives the `rollupOptions.input` map (the `main` entry plus one `<theme>_theme` entry per
  `sass/themes/*` dir, honouring `process.env.CONFIG` for single-instance builds). Not executable.
- **`generate-favicons.js`** – generates favicons / touch icons per regional config into
  `_static/assets/icons-<CONFIG>-<hash>/`, replacing `favicons-webpack-plugin`. Honours
  `process.env.CONFIG`.
- **`minify-geojson.mjs`** – minifies the geojson files that the `static` script copied into
  `_static/assets/geojson/`, replacing the old `CopyWebpackPlugin` transform.

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
