# Webpack configuration

How `webpack.config.babel.js` (repo root) is put together: what each part
does and why. Reflects the config as it stands on **webpack 5**. Update
this doc whenever the config changes structurally.

Consumed via the `build` script (`webpack --progress --color`, run with
`NODE_ENV=production`) and via `webpack-dev-server` during `yarn run dev`.
Two env vars change its behavior: `NODE_ENV` (production vs. anything else)
and `CONFIG` (regional deployment — `hsl`/`tampere`/`matka`/etc., see
`app/configurations/config.*.js`).

## Bootstrapping

`require('@babel/register')();` at the top of the file lets this
CommonJS config `require()` `./scripts/build/contextHelper` (and,
transitively, `app/config.js` and the regional configs), which use ES
module `import` syntax. It's needed because webpack-cli 5+ dropped the
automatic `interpret`-based Babel registration that used to make
`*.config.babel.js` filenames "just work". No `ignore` option is needed —
this file's require chain never reaches into `node_modules`.

`mode` comes straight from `NODE_ENV`; `isProduction`/`isDevelopment` are
derived from it and used throughout to pick different loaders, plugins,
and output settings.

## Entries & per-deployment theming

- `main` is the real app entry (`app/util/publicPath` + `app/client`), plus
  `app/util/loadDevTheme` in development only (see below).
- In production, `scripts/build/contextHelper.js` adds one `<theme>_theme`
  entry per regional theme's `sass/themes/<theme>/main.scss`, plus a
  `<sprite>` entry for any config-declared SVG sprite sheet. With `CONFIG`
  set, only the `default` theme and the selected config's theme build;
  otherwise every `app/configurations/config.*.js` deployment does.
- `faviconPlugins` (same file) generates one `favicons-webpack-plugin`
  instance per deployment, producing per-deployment favicons/app icons
  under `assets/icons-<CONFIG>-[hash]/`.
- In development, `webpack.ContextReplacementPlugin` narrows the dynamic
  `require` for `sass/themes` down to just the selected `CONFIG`'s
  `main.scss`, so the dev server doesn't build every theme.
- `app/util/loadDevTheme.js` holds a dynamic
  `require(`../../sass/themes/${window.config.CONFIG}/main.scss`)` that used
  to live inline in `app/client.js` behind an `if (IS_DEV_BUILD)` runtime
  check. That was moved into its own file, only added to `entry.main` when
  `isDevelopment`, because webpack resolves a dynamic `require`'s "context
  module" (every file the template string could possibly match) while
  building the module graph — a step that runs before any dead-code
  elimination and can't see across module boundaries. Guarding the
  `require` with an *imported* boolean constant like `IS_DEV_BUILD` didn't
  stop webpack from still resolving (and bundling) every theme's SCSS into
  production; only literally excluding the file from `entry` in production
  does. See `app/util/envUtils.js`'s `IS_DEV_BUILD` doc comment and PR
  #5929 for the full story. It reads `window.config.CONFIG` (the
  server-injected, already-resolved config object `app/client.js` uses for
  everything else) rather than `process.env.CONFIG`: the browser bundle
  never sees real build-time env var *values* (only the `ProvidePlugin`
  shim below, whose `process.env` is an empty object) unless a var is
  explicitly wired through `DefinePlugin`/`EnvironmentPlugin`, which this
  project doesn't do for `CONFIG`.

## Output

- Unhashed filenames in dev (`js/[name].js`, predictable dev-server URLs);
  content-hashed in prod (`js/[name].[contenthash].js`, long-term
  caching). Uses `[contenthash]` (hash of a chunk's own final emitted
  output), not `[chunkhash]` (hash of a chunk's entire transitive module
  graph, which can shift even when that chunk's own content didn't) —
  this is webpack5's own documented best practice for long-term caching,
  and matches the `[contenthash]` already used for CSS output below.
- `publicPath`: `/proxy/` in dev (see `devServer` below), `/` in prod.
- `crossOriginLoading: 'anonymous'` — needed for real stack traces on
  cross-origin script chunks (used with source maps).

## Module rules (loaders)

- **`app/**/*.js`** — `babel-loader`, config inline (`configFile: false`;
  `.babelrc`/`babel.config.js` are only for tooling like tests).
  `@babel/preset-env` has no explicit `targets` — it inherits the
  `browserslist` key in `package.json`, the single source of truth for
  supported browsers shared with `postcss.config.js`/autoprefixer. Also:
  `@babel/preset-react`, Relay's babel plugin, and
  `@babel/plugin-transform-runtime` (dedupes/shares Babel helper functions
  across files instead of inlining a copy per file).
- **`@hsl-fi`/`@radix-ui`/`@floating-ui` under `node_modules`** — these
  ship untranspiled modern syntax (ES2018+/ESM), so they get the same
  `@babel/preset-env` pass normally reserved for `app/**` (all other
  `node_modules` are skipped for build speed). Also sets
  `resolve.fullySpecified: false`: these packages are `"type": "module"`
  and reference extensionless subpaths (e.g. `react/jsx-runtime`) that
  webpack5's stricter default ESM resolution would otherwise reject.
- **`.mjs` under `node_modules`** — same treatment, for packages (e.g.
  `@radix-ui`) that ship a native ESM entry point instead.
- **`.scss`** — `sass-loader` → `postcss-loader` → `css-loader` →
  `style-loader` (dev) / `MiniCssExtractPlugin.loader` (prod). Includes
  Foundation Sites' Sass path via `loadPaths` (Dart Sass's modern name for
  `includePaths`) and silences deprecation warnings for constructs still
  in use (`@import`, global built-ins, color functions, `if()`).
- **`.css`** — split into two rules only so `@hsl-fi` package CSS can be
  marked `sideEffects: true` (so it isn't tree-shaken away); everything
  else uses the default.
- **Images/fonts** (`eot|png|ttf|woff|svg|jpeg|jpg`) — webpack5 built-in
  asset modules, replacing `file-loader`/`url-loader`. `asset/resource` in
  dev (always emits a real file); `asset` in prod with `maxSize: 10000`
  (inlines files under 10 KB as data URIs, otherwise emits a file).

## `devtool`

`WEBPACK_DEVTOOL` env var wins if set (`'false'` disables source maps
entirely); otherwise `source-map` in production, `eval` (fastest rebuilds,
no real source map) in development.

## Plugins

Development only gets `ContextReplacementPlugin` (see Entries above).
Production gets:

- **`faviconPlugins`** — see Entries above.
- **`InjectManifest`** (`workbox-webpack-plugin`) — builds the production
  service worker; see [Service worker](#service-worker) below.
- **`MiniCssExtractPlugin`** — extracts CSS to hashed files (prod only;
  dev uses `style-loader`).
- **`CompressionPlugin`** (×2) — pre-generates `.gz` and `.br` (Brotli)
  copies of JS/CSS/HTML/SVG/ICO assets so the server can serve
  precompressed files instead of compressing on the fly.
- **`CopyWebpackPlugin`** — copies + minifies the static GeoJSON assets
  (`static/assets/geojson`) into the build output.
- **`EntrypointStatsPlugin`** (defined at the top of this file) — small
  local stand-in for the unmaintained `stats-webpack-plugin`. Writes
  `../stats.json` with `entrypoints.<name>.assets` as a plain array of
  filename strings (the old plugin's shape), because `app/server.js`
  reads this file to know which hashed asset filenames belong to the
  `main` entrypoint, and expects that shape rather than webpack5's native
  `{ name, size }` asset objects.
- **`WebpackAssetsManifest`** — writes `../manifest.json`, a
  name→hashed-filename map, read the same way. Imported via its named
  export (`{ WebpackAssetsManifest }`); v6 changed it from a default
  export.

Both dev and prod also always get:

- **`ProvidePlugin({ process: require.resolve('process/browser'), Buffer:
  ['buffer', 'Buffer'] })`** — webpack4 used to implicitly polyfill the
  Node `process` and `Buffer` globals in browser bundles by default;
  webpack5 dropped that entirely. Without this, any bundled code that
  references the bare `process`/`Buffer` global (not just the specific
  `process.env.NODE_ENV` expression, which webpack5's `mode`-driven
  `DefinePlugin` still substitutes automatically) throws a
  `ReferenceError` at runtime. Two confirmed real cases, both in
  transitive dependencies we don't control the source of:
  - `process` — `@hsl-fi/hsl-link` (a transitive dependency of
    `@hsl-fi/button`, used by the itinerary navigator UI) bundles inlined
    Next.js router internals reading `process.env.__NEXT_*` flags with no
    guard.
  - `Buffer` — `mqtt-packet` (required by the `mqtt` package,
    dynamically imported by `app/util/mqttClient.js` for real-time
    vehicle-position streaming) calls bare `Buffer.from`/`Buffer.alloc`
    at module-init time with no guard.

  Both `process`/`buffer` npm packages are declared as direct
  `dependencies` (not `devDependencies`) since they ship inside the
  actual client bundle, matching the existing `url` polyfill
  (`resolve.fallback` below). Note `process/browser`'s `process.env` is
  always an empty object — this plugin only prevents crashes, it doesn't
  expose real build-time env var values to the browser (see "Entries &
  per-deployment theming" above for how theme selection avoids needing
  that).

### Service worker

Built from `app/util/serviceWorker.js` via Workbox's `InjectManifest`
(bundles that file and injects the precache manifest — unlike
`GenerateSW`, this keeps full control over the SW's own logic). That
source file combines:

- `precacheAndRoute(self.__WB_MANIFEST)` + `cleanupOutdatedCaches()` — the
  actual asset precaching.
- Lazy `registerRoute`/`CacheFirst` runtime caching for images, CSS, and
  external font URLs — caching them on demand instead of eagerly.
- A verbatim `cloud.typography.com` fetch handler that counts
  font-loading clicks (kept from the old `app/util/font-sw.js`, which this
  file replaces; unrelated to caching).

This all replaces the old, unmaintained, webpack5-incompatible
`offline-plugin`.

Build-time asset URLs baked into the precache manifest use a placeholder
token (`ASSET_URL_PLACEHOLDER`, from `scripts/build/assetUrlPlaceholder.js`,
shared between this config and `server/server.js`) via `InjectManifest`'s
`modifyURLPrefix`, since the real CDN URL (`ASSET_URL` env var) isn't known
at build time. `server/server.js`'s `/sw.js` route replaces that
placeholder with the real `ASSET_URL` (or `''` if unset) at request time.
This route only exists outside development (guarded by `IS_DEV_BUILD`,
since `_static/sw.js` is only produced by a production build), matching
`app/client.js`, which only ever registers the resulting service worker
via `workbox-window`'s `Workbox` class when `!IS_DEV_BUILD` (replacing
`offline-plugin/runtime`).

## Optimization

- **`TerserJsPlugin`** (`{ parallel: true }`) / **`CssMinimizerPlugin`** —
  JS/CSS minimizers, set explicitly because a custom `minimizer` array
  replaces webpack's default (JS-only) one, so CSS minimization needs
  adding back manually. `CssMinimizerPlugin` replaced the unmaintained
  `optimize-css-assets-webpack-plugin`.
- **`moduleIds`/`chunkIds`**: `'named'` in dev (readable IDs for
  debugging), `'deterministic'` in prod (webpack5's own default). These
  used to be hardcoded `'named'` everywhere, which baked full literal
  `node_modules/...` source paths into minified production output;
  `'deterministic'` is smaller while still stable for long-term caching.
- **`splitChunks`** — async chunks always split; prod also splits all
  chunks (`chunks: 'all'`) so shared vendor code isn't duplicated across
  entries. Two cache groups pull React/Relay core and this project's own
  `@digitransit-*`/`@hsl-fi` packages into their own named chunks
  (`react`, `digitransit-components`) so they cache independently from
  application code and from each other.
- **`runtimeChunk: isProduction ? 'single' : false`** — splits the
  webpack runtime (module loader glue) into its own cacheable chunk in
  production. `'single'` creates one shared runtime chunk for *all*
  entries, rather than one per entry (`'multiple'`/`true`) — this app has
  multiple entries (`main` plus one CSS-only `*_theme` entry per
  deployment via `themeEntries`), so a single shared runtime avoids
  duplicating that boilerplate across each of them. Note the runtime
  chunk's own hash will still shift on almost any unrelated chunk/module
  change (it embeds the chunk-id→hash manifest needed for lazy-chunk
  loading) — the real caching benefit is that *other* chunks (`react`,
  `digitransit-components`, route chunks, theme CSS/JS) stay stable when
  unrelated code changes, not that the runtime chunk itself never
  changes.

## `node` / `resolve` / `cache`

- **`cache: { type: 'filesystem' }`** — webpack5's built-in persistent
  build cache (replaces webpack4's memory-only `cache: true`).
- **`resolve.extensions`** adds `.mjs` ahead of the defaults so native-ESM
  entry points resolve.
- **`resolve.mainFields`** prefers `browser`, then `module` (ESM), over
  `main` (CJS) — picks up tree-shakeable ESM builds when available.
- **`resolve.alias`** forces `lodash`/`lodash.merge` (including transitive
  imports from dependencies) to `lodash-es`, since the plain CommonJS
  `lodash` build can't be tree-shaken the same way.
- **`resolve.fallback: { url: require.resolve('url/') }`** — webpack5 no
  longer auto-polyfills Node core modules. `mqtt`'s own `package.json`
  `browser` field already stubs `net`/`tls` to `false`, but it also calls
  real, reachable `url.parse()` in browser code, which needs an actual
  polyfill (the `url` package), not an empty stub.

## `devServer`

Only used by `webpack-dev-server` during `yarn run dev`. Notable:
`publicPath: '/'` under `/proxy/` (matches `output.publicPath`), `hot:
false` (full reload on change, no HMR), IPv6 loopback host (`::1`), and a
permissive CORS header so the separately-running app server
(`server/server.js`) can proxy asset requests to this dev server.

## Browser support (`browserslist` in `package.json`)

```json
"browserslist": [
  "> 0.2% in FI",
  "not op_mini all",
  "not ie <= 11",
  "not chrome < 55",
  "not safari < 11"
]
```

`"> 0.2% in FI"` is usage-share-driven, not a fixed version list — it
resolves to whatever clears 0.2% real-world usage share in Finland,
refreshed whenever `caniuse-lite` data is updated (`npx
update-browserslist-db@latest`; do this periodically — builds warn once
the data is more than ~6 months old).

`"not chrome < 55"` / `"not safari < 11"` exclude browser versions old
enough to predate native `async`/`await`. Without them, the usage-share
query alone still matched Chrome 52 (almost certainly legacy embedded
WebViews/kiosks, not real updatable browsers), forcing `@babel/preset-env`
to transpile every `async`/`await` down to generator+`regeneratorRuntime`
form. With the exclusion, the resolved Chrome floor moves to the 90s+
range; every other resolved browser/version is unaffected. This also lets
`preset-env` drop the `class-properties`/`optional-chaining`/
`nullish-coalescing`/`json-strings` transforms, which is why the
equivalent plugins used to be listed explicitly in this config — they're
redundant now and have been removed.

`"not ie <= 11"` (not just `"not IE 11"`) excludes IE11 *and* any older
IE version, matching the `< 55`/`< 11` exclusion style — IE11 was the
last IE release, so excluding only the exact version left older ones
technically permitted.

Separately, `app/server.js` uses `polyfill-library` to serve
user-agent-specific JS polyfills at runtime — intentional, documented
architecture (see `docs/Architecture.md`), not controlled by this file,
but relevant context for "old browser support" in this codebase overall.

## `postcss.config.js`

Small file outside this config, consumed by its `postcss-loader` step:
runs `autoprefixer` + `postcss-flexbugs-fixes` in production only. Still
necessary, not dead weight — `autoprefixer` still adds real vendor
prefixes today (e.g. `-webkit-user-select`, `-webkit-backdrop-filter`)
even against the current, fairly modern browserslist target; some CSS
features still need `-webkit-` fallbacks on the latest Safari regardless.
`postcss-flexbugs-fixes` isn't browserslist-driven at all — it applies a
fixed set of structural rewrites for known flexbox interop bugs
unconditionally.

## Notes on things that look suspicious but aren't

- **`_slicedToArray`/`_getIterator`/`createForOfIteratorHelper`-style
  helpers in the production bundle**: these come from `react-relay`/
  `relay-runtime`'s own pre-published CommonJS build, which bakes in its
  own `@babel/runtime` helper copies at publish time. Neither package
  exposes an ESM entry point to switch to, and this config intentionally
  doesn't transpile arbitrary `node_modules` (only the
  `@hsl-fi`/`@radix-ui`/`@floating-ui`/`.mjs` subset above needs it). Not
  fixable from this config.
- **`app/util/slicedToArray.js` / `getIterator.js` (deleted)**: hand-written
  2017-era replacements for Babel 6 `babel-runtime` helpers, wired via a
  webpack `resolve.alias` that had already been removed by the time this
  was investigated (the project uses `@babel/runtime`, not the old
  `babel-runtime` package). Fully orphaned; deleted.
