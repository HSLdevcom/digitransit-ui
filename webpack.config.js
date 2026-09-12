// The `app/` require-chain reached from `./scripts/build/contextHelper.js`
// (`app/config.js` and friends) is native ESM now - the repo is
// `"type": "module"` - so this config no longer needs `@babel/register` to
// load it. `import.meta.dirname` (as `rootDir`) replaces `__dirname`;
// `createRequire` is kept only for the two `require.resolve(...)` polyfill
// lookups below.
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserJsPlugin from 'terser-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { InjectManifest } from 'workbox-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
// This package's `exports` map subpath types aren't understood by
// eslint-plugin-import's resolver.
// eslint-disable-next-line import/no-unresolved
import { WebpackAssetsManifest } from 'webpack-assets-manifest';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { themeEntries, faviconPlugins } from './scripts/build/contextHelper.js';
import { ASSET_URL_PLACEHOLDER } from './scripts/build/assetUrlPlaceholder.js';

const require = createRequire(import.meta.url);
const rootDir = import.meta.dirname;

const mode = process.env.NODE_ENV;
const isProduction = mode === 'production';
const isDevelopment = !isProduction;

const themeExpression = /sass[/\\]themes$/;
const selectedTheme = new RegExp(
  `^./(${process.env.CONFIG || 'default'})/main.scss$`,
);

// Small stand-in for the unmaintained `stats-webpack-plugin`: writes the
// same trimmed-down stats shape that server/server.js's (via
// app/server.js) asset lookup reads to know which built JS/CSS files
// belong to the `main` entrypoint. `app/server.js` expects
// `entrypoints.<name>.assets` to be an array of plain filename strings
// (the shape `stats-webpack-plugin` used to produce), not webpack5's
// native `{ name, size }` asset objects, so that shape is preserved here.
class EntrypointStatsPlugin {
  constructor(destination) {
    this.destination = destination;
  }

  apply(compiler) {
    compiler.hooks.done.tap('EntrypointStatsPlugin', stats => {
      const { entrypoints } = stats.toJson({ all: false, entrypoints: true });
      const json = {
        entrypoints: Object.fromEntries(
          Object.entries(entrypoints).map(([name, entrypoint]) => [
            name,
            { ...entrypoint, assets: entrypoint.assets.map(a => a.name) },
          ]),
        ),
      };
      const outputPath = path.join(compiler.outputPath, this.destination);
      fs.writeFileSync(outputPath, JSON.stringify(json));
    });
  }
}

const productionPlugins = [
  ...faviconPlugins,
  new InjectManifest({
    swSrc: path.join(rootDir, 'app/util/serviceWorker.js'),
    swDest: 'sw.js',
    // Mirrors the previous offline-plugin `excludes` list: source maps,
    // compressed variants, and the per-deployment theme/sprite chunks and
    // icon assets are all left out of the eager precache manifest.
    exclude: [
      /\.map$/,
      /\.gz$/,
      /\.br$/,
      /_theme\.[^/]+\.js$/,
      /_sprite\.[^/]+\.js$/,
      /assets\/iconstats-.*\.json$/,
      /assets\/icons-[^/]+\//,
      // PNG/SVG/GeoJSON/CSS are cached lazily at runtime instead (see
      // app/util/serviceWorker.js) rather than eagerly precached, mirroring
      // the previous "optional" (safeToUseOptionalCaches) cache group.
      /\.png$/,
      /\.svg$/,
      /\.geojson$/,
      /\.css$/,
    ],
    // Bake the ASSET_URL placeholder into every precached URL; replaced
    // at request time in server/server.js. See scripts/build/assetUrlPlaceholder.js.
    modifyURLPrefix: { '': ASSET_URL_PLACEHOLDER },
  }),
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
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(rootDir, 'static/assets/geojson'),
        transform: function minify(content) {
          return JSON.stringify(JSON.parse(content.toString()));
        },
        to: path.join(rootDir, '_static/assets/geojson'),
      },
    ],
  }),
  new EntrypointStatsPlugin('../stats.json'),
  new WebpackAssetsManifest({ output: '../manifest.json' }),
];

export default {
  mode,
  entry: {
    main: [
      './app/util/publicPath',
      // Dev-only: loads the active theme's SCSS via a dynamic require.
      // Production themes are handled statically via `themeEntries` below.
      ...(isDevelopment ? ['./app/util/loadDevTheme'] : []),
      './app/client',
    ],
    ...(isProduction ? themeEntries : {}),
  },
  output: {
    path: path.join(rootDir, '_static'),
    filename: isDevelopment ? 'js/[name].js' : 'js/[name].[contenthash].js',
    chunkFilename: 'js/[contenthash].js',
    publicPath: isDevelopment ? '/proxy/' : '/',
    crossOriginLoading: 'anonymous',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(rootDir, 'app')],
        // The repo is `"type": "module"`, so webpack5 treats every `app/`
        // file as strict ESM and would otherwise demand an explicit
        // extension on every relative/subpath import. Only the small
        // server-side subgraph is loaded by Node directly (and that has
        // been made fully-specified); the client bundle keeps the
        // project's long-standing extensionless style.
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
                // both this config and other tooling (postcss/autoprefixer).
                modules: false,
              },
            ],
            [
              '@babel/preset-react',
              { development: isDevelopment, useBuiltIns: true },
            ],
          ],
          plugins: [
            'relay',
            [
              '@babel/plugin-transform-runtime',
              {
                helpers: true,
                regenerator: true,
                useESModules: true,
              },
            ],
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
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                // Modern Dart Sass JS API option name (was `includePaths`
                // under the legacy API sass-loader used to default to).
                loadPaths: [
                  path.join(rootDir, 'node_modules/foundation-sites/scss'),
                ],
                quietDeps: true,
                silenceDeprecations: [
                  'import',
                  'global-builtin',
                  'color-functions',
                  'if-function',
                ],
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
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.css$/,
        exclude: /node_modules\/@hsl-fi/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(eot|png|ttf|woff|svg|jpeg|jpg)$/,
        // Replaces file-loader (dev: always emit a separate file) /
        // url-loader (prod: inline as a data URL when small) with
        // webpack5's built-in asset modules. `parser.dataUrlCondition`
        // only applies to `type: 'asset'`, so the dev/prod distinction is
        // made by picking a different `type` outright.
        type: isDevelopment ? 'asset/resource' : 'asset',
        parser: isDevelopment
          ? undefined
          : { dataUrlCondition: { maxSize: 10000 } },
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
    // - mqtt-packet (a dependency of mqtt, used by app/util/mqttClient.js
    //   for real-time vehicle-position streaming) calls Buffer.from/
    //   Buffer.alloc etc. as bare, unguarded module-top-level globals -
    //   this crashes without the "Buffer" shim.
    new webpack.ProvidePlugin({
      process: require.resolve('process/browser'),
      Buffer: ['buffer', 'Buffer'],
    }),
    ...(isDevelopment
      ? [new webpack.ContextReplacementPlugin(themeExpression, selectedTheme)]
      : productionPlugins),
  ],
  optimization: {
    minimizer: [
      new TerserJsPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
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
          test: /[\\/]node_modules[\\/](@digitransit-component|@digitransit-search-util|@digitransit-util|@hsl-fi)[\\/]/,
        },
      },
    },
    runtimeChunk: isProduction ? 'single' : false,
  },
  performance: { hints: false },
  cache: {
    type: 'filesystem',
  },
  resolve: {
    extensions: ['.mjs', '.js', '.json'],
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
