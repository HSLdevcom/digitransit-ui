import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import webpack from 'webpack';
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserJsPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
// This package's `exports` map subpath types aren't understood by
// eslint-plugin-import's resolver.
// eslint-disable-next-line import/no-unresolved
import { WebpackAssetsManifest } from 'webpack-assets-manifest';
import {
  themeEntries,
  themeTokensPath,
  faviconPlugins,
} from './scripts/build/contextHelper.js';
import sassConfigFunctions from './scripts/build/sassConfigFunctions.js';

const require = createRequire(import.meta.url);
const rootDir = import.meta.dirname;

const mode = process.env.NODE_ENV;
const isProduction = mode === 'production';
const isDevelopment = !isProduction;

const themeTokensFile = /sass[/\\]themes[/\\](\w+)[/\\]tokens\.scss$/;

// Files in `_static` that webpack doesn't emit, so `output.clean` keeps
// them: `static/` as copied by scripts/build/copyStatic.js (plus its
// `.gz`/`.br` siblings), and the sprite sheets scripts/build/buildSprites.js
// writes as entry inputs.
const isPrebuiltStaticFile = asset =>
  /^assets\/svg-sprite\.[^/]+\.svg$/.test(asset) ||
  fs.existsSync(path.join(rootDir, 'static', asset.replace(/\.(gz|br)$/, '')));

const productionPlugins = [
  ...faviconPlugins,
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash].css',
    chunkFilename: 'css/[name].[contenthash].css',
    // Explicitly `false` (webpack's own default) rather than omitted.
    // These warnings are believed harmless (every file involved is CSS Modules
    // output with locally-scoped, per-file-hashed class names - no shared/global
    // selectors, no cross-file cascade dependency), but `ignoreOrder` is
    // intentionally left `false` rather than suppressed with `true`, so
    // the warnings stay visible as a reminder that this is an open,
    // unresolved item rather than a fully-accepted non-issue.
    ignoreOrder: false,
  }),
  new CompressionPlugin({
    filename: '[path][base].gz',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
    algorithm: 'gzip',
  }),
  new CompressionPlugin({
    filename: '[path][base].br',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
    algorithm: 'brotliCompress',
  }),
  new WebpackAssetsManifest({ output: '../manifest.json', entrypoints: true }),
];

export default {
  mode,
  entry: {
    main: [
      './app/client/publicPath',
      // Dev-only: first so that it declares the cascade layer order.
      ...(isDevelopment
        ? [
            themeTokensPath(
              process.env.CONFIG || process.env.BASE_CONFIG || 'default',
            ),
          ]
        : []),
      './app/client/client',
    ],
    ...(isProduction ? themeEntries : {}),
  },
  output: {
    path: path.join(rootDir, '_static'),
    filename: isDevelopment ? 'js/[name].js' : 'js/[name].[contenthash].js',
    chunkFilename: 'js/[contenthash].js',
    publicPath: isDevelopment ? '/proxy/' : '/',
    crossOriginLoading: 'anonymous',
    clean: { keep: isPrebuiltStaticFile },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(rootDir, 'app'),
          path.resolve(rootDir, 'utils/client'),
          path.resolve(rootDir, 'utils/shared'),
        ],
        // The repo is `"type": "module"`, so webpack5 would otherwise treat
        // every `app/`/`utils/client/`/`utils/shared/` file as strict ESM:
        // (1) it'd demand an explicit extension on every relative import
        // (the client bundle keeps its long-standing extensionless style
        // instead), and (2) several files default-import third-party UMD
        // packages (e.g.
        // `@hsl-fi/modal`) whose `__esModule` flag is set inside a UMD
        // factory rather than visibly at the module's top level - strict
        // ESM can't prove that flag through the wrapper and binds the raw
        // CJS exports instead of `.default`, crashing with React error #130
        // ("Element type is invalid"). `javascript/auto`'s lenient,
        // runtime-checked interop avoids both problems. Third-party
        // packages we don't control the build of, so unlike the
        // `digitransit-component`/`digitransit-store` rule below (fixed via
        // our own real ESM build), this has to stay regardless of that fix.
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
        loader: 'babel-loader',
        options: {
          configFile: false,
          presets: [
            [
              '@babel/preset-env',
              {
                // No explicit `targets` here: this intentionally inherits
                // the `browserslist` key from package.json, which is the
                // single source of truth for supported browsers across
                // both this config and the Lightning CSS minimizer below.
                modules: false,
                bugfixes: true,
                // Expands `import 'core-js/stable'` in app/client/client.jsx
                // to the modules the targets lack. Keep the corejs version
                // in sync with the installed core-js minor.
                useBuiltIns: 'entry',
                corejs: { version: '3.50' },
              },
            ],
            [
              '@babel/preset-react',
              { development: isDevelopment, runtime: 'automatic' },
            ],
          ],
          plugins: [
            'relay',
            ['@babel/plugin-transform-runtime', { helpers: true }],
            ...(isProduction
              ? [
                  [
                    'transform-react-remove-prop-types',
                    { mode: 'remove', removeImport: true },
                  ],
                ]
              : []),
          ],
        },
      },
      {
        // These node_modules packages ship untranspiled ES2018+ / ESM syntax
        test: /\.js$/,
        include: /node_modules\/(@hsl-fi|@radix-ui|@floating-ui)/,
        // These packages are published as `"type": "module"` and reference
        // extensionless subpaths (e.g. `react/jsx-runtime`) that webpack5's
        // stricter ESM resolution (`fullySpecified: true` by default for
        // ESM sources) refuses to resolve without this.
        resolve: { fullySpecified: false },
        loader: 'babel-loader',
        options: {
          configFile: false,
          presets: [
            [
              '@babel/preset-env',
              {
                modules: false,
                bugfixes: true,
              },
            ],
          ],
        },
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        // Same fully-specified-extension relaxation as the `@hsl-fi`/
        // `@radix-ui`/`@floating-ui` rule above - `.mjs` node_modules
        // packages (e.g. @radix-ui's `dist/index.mjs`) reference
        // extensionless subpaths like `react/jsx-runtime`.
        resolve: { fullySpecified: false },
        use: {
          loader: 'babel-loader',
          options: {
            configFile: false,
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                  bugfixes: true,
                },
              ],
            ],
          },
        },
      },
      {
        // All 4 digitransit-* packages set "type": "module" (so
        // their raw source/tests run as native ESM) - which webpack, following
        // that package.json field, parses as strict `javascript/esm` rather
        // than `auto`. This causes two distinct problems when bundled directly
        // into the app (not through app/**'s lenient babel-loader rule):
        //   1. Several packages default-import third-party CJS dependencies
        //      (e.g. `@hsl-fi/modal`) that use Babel's userland `__esModule`-
        //      marker convention instead of a real "exports"/"module" field.
        //      Webpack's *lenient* `javascript/auto` interop recognizes that
        //      marker and unwraps `.default` (matching what Babel itself
        //      does, and what every `app/` file gets); its *strict* ESM
        //      interop follows real Node semantics instead, where a CJS
        //      default import is simply the whole `module.exports` - silently
        //      handing components like `Modal` the entire exports object
        //      instead of the component function, which blows up at render
        //      time with "Element type is invalid".
        //   2. Strict ESM also requires relative imports to be "fully
        //      specified" (explicit file extension) - but these packages'
        //      own `import/extensions` policy is "never" (matching app/**),
        //      so an extensionless relative import (valid and required by
        //      lint) would otherwise fail to resolve here.
        // Force `javascript/auto` here so these packages get the same
        // lenient interop as the rest of the app. `type: 'javascript/auto'`
        // alone only changes CJS/ESM interop, not extension-resolution
        // strictness, so `resolve.fullySpecified: false` is needed too
        // (matching the `.mjs`/node_modules rule above) to fix problem 2.
        test: /\.js$/,
        include: [path.resolve(rootDir, 'packages')],
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
      },
      {
        test: /\.scss$/,
        use: [
          isDevelopment
            ? 'style-loader'
            : {
                loader: MiniCssExtractPlugin.loader,
                options: { publicPath: 'auto' },
              },
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: ({ resourcePath }) => {
                const [, theme] = resourcePath.match(themeTokensFile) || [];
                return {
                  // No BOM/@charset: Sass adds one to non-ASCII output, and a
                  // BOM mid-bundle invalidates the selector that follows it.
                  charset: false,
                  quietDeps: true,
                  silenceDeprecations: [
                    'import',
                    'global-builtin',
                    'color-functions',
                    'if-function',
                  ],
                  ...(theme ? { functions: sassConfigFunctions(theme) } : {}),
                };
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        include: /node_modules\/@hsl-fi/,
        sideEffects: true,
        use: [
          isDevelopment
            ? 'style-loader'
            : {
                loader: MiniCssExtractPlugin.loader,
                options: { publicPath: 'auto' },
              },
          'css-loader',
        ],
      },
      {
        test: /\.css$/,
        exclude: /node_modules\/@hsl-fi/,
        use: [
          isDevelopment
            ? 'style-loader'
            : {
                loader: MiniCssExtractPlugin.loader,
                options: { publicPath: 'auto' },
              },
          'css-loader',
        ],
      },
      {
        test: /\.(eot|gif|png|ttf|woff|svg|jpeg|jpg)$/,
        // webpack5 built-in asset modules, replacing file-loader/url-loader.
        // Never inlines as a data URL: app/client/assetUrl.js makes every
        // image under app/assets/images/ reachable from the main chunk, and
        // inlining the small ones would add ~130 kB of base64 to it.
        type: 'asset/resource',
        generator: { filename: 'assets/[contenthash][ext]' },
      },
    ],
  },
  devtool:
    process.env.WEBPACK_DEVTOOL === 'false'
      ? false
      : process.env.WEBPACK_DEVTOOL || (isProduction ? 'source-map' : 'eval'),
  plugins: [
    // webpack4 used to implicitly polyfill Node globals ("process",
    // "Buffer", ...) in browser bundles; webpack5 dropped that automatic
    // behavior, so any bundled code (ours or a dependency's) that
    // references one of these bare globals now throws "X is not defined"
    // at runtime unless we provide it ourselves. Needed in both dev and
    // prod. Our own app code doesn't need either of these (it reads
    // window.config instead of process.env client-side, and doesn't use
    // Buffer at all), but:
    // - @hsl-fi/hsl-link (a transitive dependency of @hsl-fi/button, used
    //   by the itinerary navigator UI) bundles leftover Next.js router
    //   internals that read process.env.__NEXT_* unconditionally, with no
    //   guard - this crashes without the "process" shim. Note
    //   process/browser's process.env is always {} (no real env values),
    //   so this only prevents crashes; it doesn't expose actual
    //   build-time environment variables to the browser.
    // - mqtt-packet (a dependency of mqtt, used by utils/client/mqttClient.js
    //   for real-time vehicle-position streaming) calls Buffer.from/
    //   Buffer.alloc etc. as bare, unguarded module-top-level globals -
    //   this crashes without the "Buffer" shim.
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
      Buffer: ['buffer', 'Buffer'],
    }),
    ...(isDevelopment ? [] : productionPlugins),
  ],
  optimization: {
    minimizer: [
      new TerserJsPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify,
        minimizerOptions: {
          // Keep `min-width`/`max-width` media queries instead of range
          // syntax (`width>=…`): browsers older than the targets (and the
          // e2e suite's Chromium) would otherwise get the mobile layout.
          include: Features.MediaRangeSyntax,
          targets: browserslistToTargets(
            browserslist(undefined, { path: rootDir }),
          ),
        },
      }),
    ],
    // 'named' module/chunk IDs give readable debugging output, but they
    // bake full literal `node_modules/...` file paths into the bundle -
    // fine for development, but unnecessary bloat (and mildly informative
    // to end users) in production. Production uses webpack5's own
    // `'deterministic'` default instead, which is smaller and still
    // stable enough for long-term caching.
    moduleIds: isDevelopment ? 'named' : 'deterministic',
    chunkIds: isDevelopment ? 'named' : 'deterministic',
    splitChunks: {
      chunks: isProduction ? 'all' : 'async',
      cacheGroups: {
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|react-relay|relay-runtime)[\\/]/,
        },
        digitransitComponents: {
          name: 'digitransit-components',
          // The 4 `digitransit-*` packages are Yarn-workspace
          // symlinks, so webpack resolves them to their real path outside
          // `node_modules` entirely - hence the second, bare alternative
          // below (no `node_modules[\\/]` prefix), unlike the `@hsl-fi`
          // branch and the `react` cache group above.
          test: /[\\/](node_modules[\\/]@hsl-fi|digitransit-(?:component|search-util|store|util))[\\/]/,
        },
      },
    },
    runtimeChunk: isProduction ? 'single' : false,
  },
  performance: { hints: false },
  cache: {
    type: 'filesystem',
    // `CONFIG` decides which theme entries and favicons get built.
    version: process.env.CONFIG || 'all',
    // Invalidate the cache when the build config itself changes, including
    // package.json's `browserslist` (Babel and Lightning CSS targets).
    buildDependencies: {
      config: [
        import.meta.filename,
        path.join(rootDir, 'scripts/build/contextHelper.js'),
        path.join(rootDir, 'package.json'),
      ],
    },
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.json'],
    mainFields: ['browser', 'module', 'main'],
    alias: {
      lodash: 'lodash-es',
      'lodash.merge': 'lodash-es/merge',
    },
    // webpack5 no longer auto-polyfills Node core modules. `net`/`tls`
    // are already stubbed to `false` by mqtt's own package.json `browser`
    // field remapping, but its `url.parse()` call for parsing broker URLs
    // is real (reachable) code in the browser bundle, so it needs an
    // actual browser-compatible implementation, not an empty stub.
    fallback: {
      url: require.resolve('url/'),
    },
  },
  devServer: {
    compress: true,
    host: '::1',
    hot: false,
    port: process.env.HOT_LOAD_PORT || 9000,
    devMiddleware: {
      publicPath: '/',
    },
    static: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    client: {
      overlay: true,
    },
  },
};
