const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJsPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const OfflinePlugin = require('offline-plugin');

const CompressionPlugin = require('compression-webpack-plugin');

const WebpackAssetsManifest = require('webpack-assets-manifest');
const StatsPlugin = require('stats-webpack-plugin');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const {
  languages,
  themeEntries,
  faviconPlugins,
} = require('./build/contextHelper');

const mode = process.env.NODE_ENV;
const isProduction = mode === 'production';
const isDevelopment = !isProduction;

const languageExp = new RegExp(`^./(${languages.join('|')})$`);
const momentExpression = /moment[/\\]locale$/;
const reactIntlExpression = /react-intl[/\\]locale-data$/;
const intlExpression = /intl[/\\]locale-data[/\\]jsonp$/;
const themeExpression = /sass[/\\]themes$/;
const selectedTheme = new RegExp(
  `^./(${process.env.CONFIG || 'default'})/main.scss$`,
);

const productionPlugins = [
  ...faviconPlugins,
  new OfflinePlugin({
    excludes: [
      '**/.*',
      '**/*.map',
      '**/*.txt',
      '../stats.json',
      '../manifest.json',
      '**/*.gz',
      '**/*.br',
      'js/*_theme.*.js',
      'js/*_sprite.*.js',
      'assets/iconstats-*.json',
      'assets/icons-*/*',
    ],
    caches: {
      main: [':rest:'],
      additional: [],
      optional: [
        '*.png',
        'css/*.css',
        'assets/*.svg',
        'emitter/*.js',
        'assets/geojson/*.geojson',
        ':externals:',
      ],
    },
    // src for google fonts might change so https://fonts.gstatic.com addresses might require
    // some maintenance in this list to still keep them cached by service worker in the future.
    externals: [
      'https://prod.hslfi.hsldev.com/fonts/784131/007A16DD5A18D7C65.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/02F09E5BF2B925BD4.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/076040301BB485C9D.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/1346928704B9283E5.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/1CEFF336D57976EB3.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/1DEEABB198BE4D63F.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/22BA455A4091CC19F.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/2566FE490EDCD6F67.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/277846DB00CF3DB06.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/29B67461E5589EE74.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/2D217B7668941A793.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/3253FBE4A5A578F2D.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/52619AB133F6BB86A.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/532E82510FFBBD207.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/534F8B08DDF1CC33C.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/5604F98701832EA61.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/5F469DF892D6FD752.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/6C5FB8083F348CFBB.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/700C98F3EEEA5EA60.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/7FEEF2DCF7989828E.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/80E39C8AEE33E2FB1.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/85C0D47CA441BAC9A.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/86C88F4E5D2372CB2.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/8819A4AEF420691AB.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/8A8537319E1714352.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/8D4A612AC08BB49AA.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/9A41B5190DBEBADE0.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/B037480DAA4A9B18C.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/B378660B7DF3850A2.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/B3B6DD3CB8EB8281F.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/B45A71222EB5CBFF4.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/B6BF52DDCDAE17D49.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/BE27263FF5E4969A1.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/C54DDF82AD3DE0D70.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/C593C722D057C1CB2.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/C704C82D97246BB50.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/D01FA66F6F11C1D46.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/D147F710C34D01D03.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/E8B40404B085B82FD.css',
      'https://prod.hslfi.hsldev.com/fonts/784131/F694B0ED52086B2B4.css',
      'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu7GxKOzY.woff2',
      'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2',
      'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfChc4EsA.woff2',
      'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc4.woff2',
      'https://fonts.gstatic.com/s/robotocondensed/v19/ieVl2ZhZI2eCN5jzbjEETS9weq8-19y7DRs5.woff2',
      'https://fonts.gstatic.com/s/robotocondensed/v19/ieVl2ZhZI2eCN5jzbjEETS9weq8-19K7DQ.woff2',
      'https://fonts.gstatic.com/s/robotocondensed/v19/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCoYb8td.woff2',
      'https://fonts.gstatic.com/s/robotocondensed/v19/ieVi2ZhZI2eCN5jzbjEETS9weq8-32meGCQYbw.woff2',
    ],
    updateStrategy: 'changed',
    autoUpdate: 1000 * 60 * 5,
    safeToUseOptionalCaches: true,
    ServiceWorker: {
      entry: './app/util/font-sw.js',
      events: true,
    },
    version: '[hash]',
  }),
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash].css',
    chunkFilename: 'css/[name].[contenthash].css',
  }),
  new CompressionPlugin({
    filename: '[path].gz[query]',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
    algorithm: 'gzip',
  }),
  new CompressionPlugin({
    filename: '[path].br[query]',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
    algorithm: 'brotliCompress',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(__dirname, 'static/assets/geojson'),
        transform: function minify(content) {
          return JSON.stringify(JSON.parse(content.toString()));
        },
        to: path.join(__dirname, '_static/assets/geojson'),
      },
    ],
  }),
  new StatsPlugin('../stats.json', { chunkModules: true }),
  new WebpackAssetsManifest({ output: '../manifest.json' }),
];

module.exports = {
  mode,
  entry: {
    main: ['./app/util/publicPath', './app/client'],
    ...(isProduction ? themeEntries : {}),
  },
  output: {
    path: path.join(__dirname, '_static'),
    filename: isDevelopment ? 'js/[name].js' : 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[chunkhash].js',
    publicPath: isDevelopment ? '/proxy/' : `${process.env.APP_PATH || ''}/`,
    crossOriginLoading: 'anonymous',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'app')],
        loader: 'babel-loader',
        options: {
          configFile: false,
          presets: [
            [
              '@babel/preset-env',
              {
                // loose is needed by older Androids < 4.3 and IE10
                loose: true,
                modules: false,
              },
            ],
            [
              '@babel/preset-react',
              { development: isDevelopment, useBuiltIns: true },
            ],
          ],
          plugins: [
            ['relay', { compat: true, schema: 'build/schema.json' }],
            [
              '@babel/plugin-transform-runtime',
              {
                helpers: true,
                regenerator: true,
                useESModules: true,
              },
            ],
            '@babel/plugin-syntax-dynamic-import',
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            '@babel/plugin-proposal-json-strings',
          ],
        },
      },
      {
        test: /\.scss$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(eot|png|ttf|woff|svg|jpeg|jpg)$/,
        loader: isDevelopment ? 'file-loader' : 'url-loader',
        options: { limit: 10000, outputPath: 'assets' },
      },
    ],
  },
  devtool: isProduction ? 'source-map' : 'eval',
  plugins: [
    new webpack.ContextReplacementPlugin(momentExpression, languageExp),
    new webpack.ContextReplacementPlugin(reactIntlExpression, languageExp),
    new webpack.ContextReplacementPlugin(intlExpression, languageExp),
    ...(isDevelopment
      ? [new webpack.ContextReplacementPlugin(themeExpression, selectedTheme)]
      : productionPlugins),
  ],
  optimization: {
    minimizer: [
      new TerserJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    moduleIds: 'named',
    chunkIds: 'named',
    splitChunks: {
      chunks: isProduction ? 'all' : 'async',
      cacheGroups: {
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|react-relay|relay-runtime)[\\/]/,
          reuseExistingChunk: false,
        },
        digitransitComponents: {
          name: 'digitransit-components',
          test: /[\\/]node_modules[\\/](@digitransit-component|@digitransit-search-util|@digitransit-util|@hsl-fi)[\\/]/,
          reuseExistingChunk: false,
        },
      },
    },
    runtimeChunk: isProduction,
  },
  performance: { hints: false },
  node: {
    net: 'empty',
    tls: 'empty',
  },
  cache: true,
  resolve: {
    mainFields: ['browser', 'module', 'jsnext:main', 'main'],
    alias: {
      lodash: 'lodash-es',
      'lodash.merge': 'lodash-es/merge',
      moment$: 'moment/moment.js',
      'babel-runtime/helpers/slicedToArray': path.join(
        __dirname,
        'app/util/slicedToArray',
      ),
      'babel-runtime/core-js/get-iterator': path.join(
        __dirname,
        'app/util/getIterator',
      ),
    },
  },
  externals: {
    'babel-runtime/core-js/array/from': 'var Array.from',
    '../core-js/array/from': 'var Array.from',
    'babel-runtime/core-js/json/stringify': 'var JSON.stringify',
    'babel-runtime/core-js/map': 'var Map',
    'babel-runtime/core-js/object/assign': 'var Object.assign',
    'babel-runtime/core-js/object/create': 'var Object.create',
    '../core-js/object/create': 'var Object.create',
    'babel-runtime/core-js/object/define-property': 'var Object.defineProperty',
    '../core-js/object/define-property': 'var Object.defineProperty',
    'babel-runtime/core-js/object/entries': 'var Object.entries',
    'babel-runtime/core-js/object/freeze': 'var Object.freeze',
    'babel-runtime/core-js/object/keys': 'var Object.keys',
    '../core-js/object/get-own-property-descriptor':
      'var Object.getOwnPropertyDescriptor',
    'babel-runtime/core-js/object/get-prototype-of':
      'var Object.getPrototypeOf',
    '../core-js/object/get-prototype-of': 'var Object.getPrototypeOf',
    'babel-runtime/core-js/object/set-prototype-of':
      'var Object.setPrototypeOf',
    '../core-js/object/set-prototype-of': 'var Object.setPrototypeOf',
    'babel-runtime/core-js/promise': 'var Promise',
    '../core-js/symbol': 'var Symbol',
    '../core-js/symbol/iterator': 'var Symbol.iterator',
    'babel-runtime/core-js/weak-map': 'var WeakMap',

    'babel-runtime/helpers/extends': 'var Object.assign',
    'object-assign': 'var Object.assign',
    'simple-assign': 'var Object.assign',

    'fbjs/lib/fetch': 'var fetch',
    './fetch': 'var fetch',

    'fbjs/lib/Map': 'var Map',
  },
  devServer: {
    publicPath: '/',
    noInfo: true,
    compress: true,
    host: '0.0.0.0',
    port: process.env.HOT_LOAD_PORT || 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    overlay: true,
  },
};
