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
import { themeEntries, faviconPlugins } from './scripts/build/contextHelper.js';
import sassConfigFunctions from './scripts/build/sassConfigFunctions.js';

const require = createRequire(import.meta.url);
const rootDir = import.meta.dirname;

const mode = process.env.NODE_ENV;
const isProduction = mode === 'production';
const isDevelopment = !isProduction;

const themeFile = /styles[/\\]themes[/\\](\w+)[/\\]theme\.scss$/;

// Files in `_static` that webpack doesn't emit, so `output.clean` keeps
// them: `static/` as copied by scripts/build/copyStatic.js (plus its
// `.gz`/`.br` siblings), and the sprite sheets scripts/build/buildSprites.js
// writes as entry inputs.
const isPrebuiltStaticFile = asset =>
  /^assets\/svg-sprite\.[^/]+\.svg$/.test(asset) ||
  fs.existsSync(path.join(rootDir, 'static', asset.replace(/\.(gz|br)$/, '')));

// CSS is always extracted to files (also in dev, where the HTML shell links
// them), and load order matches production.
const cssExtractLoader = {
  loader: MiniCssExtractPlugin.loader,
  options: { publicPath: 'auto' },
};

const jsFilename = isDevelopment
  ? 'js/[name].js'
  : 'js/[name].[contenthash].js';

const cssFilename = isDevelopment
  ? 'css/[name].css'
  : 'css/[name].[contenthash].css';

const cssExtractPlugin = new MiniCssExtractPlugin({
  filename: cssFilename,
  chunkFilename: cssFilename,
  // Keeps the "conflicting order" warnings visible as an open item.
  ignoreOrder: false,
});

const productionPlugins = [
  ...faviconPlugins,
  // main.css has ported third-party code, this is the CSS version of the
  // pointer Terser adds to JS bundles.
  new webpack.BannerPlugin({
    banner: 'For license information please see ../third-party-licenses.txt',
    test: /^css\/main\./,
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
    main: ['./app/client/publicPath', './app/client/client'],
    ...themeEntries,
  },
  output: {
    path: path.join(rootDir, '_static'),
    filename: jsFilename,
    chunkFilename: jsFilename,
    publicPath: '/',
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
        // runtime-checked interop avoids both problems.
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
                corejs: { version: '3.51' },
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
        // The workspace packages are `"type": "module"`, so webpack would parse
        // them as strict ESM. Their built `lib/index.js` default-imports CJS
        // packages that mark ESM interop with Babel's `__esModule` flag (e.g.
        // `@hsl-fi/shimmer`): strict ESM binds the whole `module.exports`, so
        // the component is an object and React throws "Element type is
        // invalid". `javascript/auto` unwraps `.default` as in `app/`, and
        // `fullySpecified: false` resolves extensionless subpath imports such
        // as `lodash/omit`.
        test: /\.js$/,
        include: [path.resolve(rootDir, 'packages')],
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
      },
      {
        test: /\.scss$/,
        use: [
          cssExtractLoader,
          {
            loader: 'css-loader',
            // `import styles from './x.module.scss'`, as in the packages.
            options: {
              modules: {
                auto: true,
                namedExport: false,
                exportLocalsConvention: 'as-is',
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: ({ resourcePath }) => {
                const [, theme] = resourcePath.match(themeFile) || [];
                return {
                  // No BOM/@charset: Sass adds one to non-ASCII output, and a
                  // BOM mid-bundle invalidates the selector that follows it.
                  charset: false,
                  quietDeps: true,
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
        use: [cssExtractLoader, 'css-loader'],
      },
      {
        test: /\.css$/,
        exclude: /node_modules\/@hsl-fi/,
        use: [cssExtractLoader, 'css-loader'],
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
    cssExtractPlugin,
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
    // One runtime for all entries, inlined by server/middleware/shell.js. In
    // development, a second runtime (the theme's) would break hot updates.
    runtimeChunk: 'single',
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
};
