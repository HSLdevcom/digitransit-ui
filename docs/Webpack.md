# Webpack configuration

This document explains how `webpack.config.babel.js` (repo root) is put
together: what each section does and why it exists. It reflects the config
as it currently stands (webpack 4). If the config is later migrated to a
newer webpack major version or otherwise restructured, update this doc to
match.

The config is consumed via the `build` script
(`node_modules/.bin/webpack --progress --color`, run with `NODE_ENV=production`)
and via `webpack-dev-server` during `yarn run dev`. `NODE_ENV` (production vs.
anything else) and `CONFIG` (regional deployment, e.g. `hsl`/`tampere`/`matka`,
see `app/configurations/config.*.js`) are the two environment variables that
change its behavior.

## Mode / environment switches

- `mode` is taken directly from `NODE_ENV`.
- `isProduction` / `isDevelopment` are derived from it and used throughout the
  config to pick different loaders, plugins, and output settings for dev vs.
  prod builds.

## Entries and per-deployment theming (`entry`, `scripts/contextHelper.js`)

- `main` is the actual application entry (`app/util/publicPath` + `app/client`).
- In production, additional entries come from `themeEntries`
  (`scripts/contextHelper.js`): one `<theme>_theme` entry per regional theme's
  `sass/themes/<theme>/main.scss`, plus a `<sprites>` entry for the config's
  SVG sprite sheet if it declares one. When `CONFIG` is set, only the
  `default` theme and the selected config's theme are built; otherwise every
  `app/configurations/config.*.js` deployment is included.
- `faviconPlugins` (also from `contextHelper.js`) generates one
  `favicons-webpack-plugin` instance per deployment config, producing
  deployment-specific favicons/app icons under `assets/icons-<CONFIG>-[hash]/`.
- In development, `webpack.ContextReplacementPlugin` narrows webpack's dynamic
  `require` resolution for `sass/themes` down to just the selected `CONFIG`'s
  `main.scss`, so the dev server doesn't try to build every theme.

## Output

- Filenames are unhashed in development (`js/[name].js`) for predictable
  dev-server URLs, and content-hashed in production
  (`js/[name].[chunkhash].js`) for long-term browser caching.
- `publicPath` is `/proxy/` in development (see `webpack-dev-server` config
  below) and `/` in production.
- `crossOriginLoading: 'anonymous'` is required for browsers to report real
  stack traces/errors for cross-origin script chunks (used with source maps).

## Module rules (loaders)

- **`app/**/*.js`**: transpiled with `babel-loader`, configured inline
  (`configFile: false`, ignoring `.babelrc`/`babel.config.js`, which are only
  used for tooling like tests). Uses `@babel/preset-env` (targets come from
  the `browserslist` key in `package.json`, since no explicit `targets` is
  set here) and `@babel/preset-react`, plus Relay's babel plugin and
  `@babel/plugin-transform-runtime` for shared helper/regenerator injection.
- **A subset of `node_modules` (`@hsl-fi`, `@radix-ui`, `@floating-ui`)**:
  these packages ship untranspiled modern syntax (ES2018+/ESM) and need the
  same `@babel/preset-env` pass applied to them specifically, since
  `node_modules` is otherwise excluded from transpilation for build speed.
- **`.mjs` files under `node_modules`**: same reasoning — some dependencies
  ship native ESM entry points that still need `@babel/preset-env`.
- **`.scss` files**: `sass-loader` → `postcss-loader` → `css-loader` →
  (`style-loader` in dev / `MiniCssExtractPlugin.loader` in prod). Includes
  Foundation Sites' Sass path and suppresses known Dart Sass deprecation
  warnings for constructs still in use (`@import`, global built-ins, color
  functions, `if()`).
- **`.css` files**: split into two rules only to control `sideEffects` —
  `@hsl-fi` package CSS is explicitly marked as having side effects (so
  webpack won't tree-shake it away), everything else uses the default.
- **Images/fonts** (`eot|png|ttf|woff|svg|jpeg|jpg`): `file-loader` in dev
  (always emits a real file, faster incremental rebuilds) and `url-loader` in
  prod (inlines files under 10 KB as data URIs to cut HTTP requests, falls
  back to `file-loader` behavior above that).

## `devtool`

Controlled by `WEBPACK_DEVTOOL` env var if set (`'false'` disables source
maps entirely); otherwise `source-map` in production, `eval` (fastest
rebuild, no real source map) in development.

## Plugins

Development only gets the `ContextReplacementPlugin` described above.
Production gets `productionPlugins`:

- `faviconPlugins` — see Entries section above.
- `OfflinePlugin` — generates the service worker (`sw.js`, served by
  `server/server.js`) that caches app assets and a fixed list of external
  Google Fonts/HSL font CSS URLs offline. `app/client.js` registers the
  runtime (`offline-plugin/runtime`) that talks to this service worker.
  **Unmaintained since ~2019 and has no webpack5 support** — flagged for
  replacement (e.g. `workbox-webpack-plugin`) in any future webpack5
  migration.
- `MiniCssExtractPlugin` — extracts CSS into hashed files instead of
  inlining it via `<style>` tags (only used in production; dev uses
  `style-loader` instead, see loaders above).
- `CompressionPlugin` (×2) — pre-generates `.gz` and `.br` (Brotli) versions
  of JS/CSS/HTML/SVG/ICO assets so the server can serve pre-compressed
  files instead of compressing on the fly.
- `CopyWebpackPlugin` — copies and minifies (whitespace-strips) the static
  GeoJSON assets under `static/assets/geojson` into the build output.
- `StatsPlugin` — writes a trimmed `../stats.json` (just entrypoint/asset
  info) that `app/server.js` reads at runtime to know which hashed asset
  filenames to reference in server-rendered HTML.
- `WebpackAssetsManifest` — writes `../manifest.json`, a simpler
  name→hashed-filename map, used similarly.

## Optimization

- `TerserJsPlugin` / `OptimizeCSSAssetsPlugin` — JS and CSS minimizers,
  swapped in explicitly because setting a custom `minimizer` array replaces
  webpack's default JS-only minimizer (so CSS minimization has to be added
  back manually).
- `moduleIds`/`chunkIds: 'named'` — use readable module/chunk identifiers
  instead of numeric ones, for easier debugging of build output; costs a
  little bit of bundle size compared to numeric or hashed IDs.
- `splitChunks` — always split async chunks; in production also splits all
  chunks (`chunks: 'all'`) so shared vendor code lands in shared files
  rather than being duplicated. Two explicit cache groups pull React/Relay
  core packages and this project's own `@digitransit-*`/`@hsl-fi` packages
  into their own named chunks (`react`, `digitransit-components`) so they
  cache independently from application code and from each other.
- `runtimeChunk: isProduction` — in production, the webpack runtime
  (module loader glue) is split into its own chunk so it can be cached
  separately from both vendor and app code.

## `node`, `resolve`

- `node: { net: 'empty', tls: 'empty' }` tells webpack4 to stub these two
  Node core modules instead of erroring if something in the dependency graph
  references them. **The original reason isn't documented in git history**;
  it's unclear whether anything in the current dependency graph still needs
  this. Flagged as a cleanup/verification candidate.
- `resolve.extensions` adds `.mjs` ahead of the defaults so native-ESM
  dependency entry points resolve correctly.
- `resolve.mainFields` prefers `browser` entry points, then ES module
  (`module`) entry points, over CommonJS (`main`) — lets webpack pick up
  tree-shakeable ESM builds of dependencies when available.
- `resolve.alias` forces all `lodash`/`lodash.merge` imports (including
  transitive ones from dependencies) to resolve to `lodash-es`, so
  webpack's tree-shaking can drop unused lodash functions; the plain
  CommonJS `lodash` build can't be tree-shaken the same way.

## `devServer`

Used only by `webpack-dev-server` during `yarn run dev`. Notable settings:
`publicPath: '/'` under `/proxy/` (matches `output.publicPath` above),
`hot: false` (no Hot Module Replacement — full page reload on change),
IPv6 loopback host (`::1`), and a permissive CORS header so the app server
(running separately, see `server/server.js`) can be proxied to this dev
server for assets.

## Known legacy/unclear areas (tracked separately)

- The project is still on **webpack 4**, which has been unsupported for
  years, along with matching webpack4-era plugin versions (some
  unmaintained, e.g. `offline-plugin`, `stats-webpack-plugin`,
  `optimize-css-assets-webpack-plugin`). The `NODE_OPTIONS=--openssl-legacy-provider`
  flag in the `build`/`dev` npm scripts exists specifically to work around
  webpack4's default hash algorithm being incompatible with modern
  Node/OpenSSL — a symptom of this.
- The `node: { net: 'empty', tls: 'empty' }` config (see above) needs
  investigation to confirm whether it's still required.
- Browser support: `browserslist` in `package.json` already excludes IE11
  and Opera Mini. Separately, `app/server.js` uses `polyfill-library` to
  serve user-agent-specific JS polyfills at runtime — this is intentional,
  documented app architecture (see `docs/Architecture.md`), not something
  this file controls, but it's worth keeping in mind when reasoning about
  "old browser support" in this codebase.
