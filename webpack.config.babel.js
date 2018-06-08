const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const OfflinePlugin = require('offline-plugin');

const ZopfliCompressionPlugin = require('zopfli-webpack-plugin');
const BrotliCompressionPlugin = require('brotli-webpack-plugin');

const WebpackAssetsManifest = require('webpack-assets-manifest');
const StatsPlugin = require('stats-webpack-plugin');

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
      '../stats.json',
      '../manifest.json',
      '**/*.gz',
      '**/*.br',
      'js/*_theme.*.js',
      'js/*_sprite.*.js',
      'iconstats-*.json',
      'icons-*/*',
    ],
    caches: {
      main: [':rest:'],
      additional: [':externals:'],
      optional: ['*.png', 'css/*.css', '*.svg'],
    },
    // TODO: Can be enabled after cors headers have been added
    // externals: ['https://dev.hsl.fi/tmp/452925/86FC9FC158618AB68.css'],
    externals: ['/'],
    cacheMaps: [
      {
        // eslint-disable-next-line object-shorthand
        match: function(requestUrl) {
          return requestUrl.pathname;
        },
        requestTypes: ['navigate'],
      },
    ],
    updateStrategy: 'changed',
    autoUpdate: 1000 * 60,
    safeToUseOptionalCaches: true,
    ServiceWorker: {
      entry: './app/util/font-sw.js',
      events: true,
      publicPath: 'sw.js',
    },
    version: '[hash]',
    relativePaths: true,
  }),
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash].css',
    chunkFilename: 'css/[name].[contenthash].css',
  }),
  new ZopfliCompressionPlugin({
    asset: '[path].gz[query]',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
  }),
  new BrotliCompressionPlugin({
    asset: '[path].br[query]',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
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
    filename: isDevelopment ? 'js/bundle.js' : 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[chunkhash].js',
    publicPath: isDevelopment ? '/proxy/' : `${process.env.APP_PATH || '../'}`,
    crossOriginLoading: 'anonymous',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'app')],
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                // loose is needed by older Androids < 4.3 and IE10
                loose: true,
                modules: false,
              },
            ],
            ['@babel/preset-stage-3', { loose: true, useBuiltIns: true }],
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
                polyfill: false,
                regenerator: true,
                useBuiltIns: true,
                useESModules: true,
              },
            ],
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
        test: /\.(eot|png|ttf|woff|svg)$/,
        loader: isDevelopment ? 'file-loader' : 'url-loader',
        options: { limit: 10000 },
      },
    ],
  },
  devtool: isProduction ? 'source-map' : 'eval',
  plugins: [
    new webpack.ContextReplacementPlugin(momentExpression, languageExp),
    new webpack.ContextReplacementPlugin(reactIntlExpression, languageExp),
    new webpack.ContextReplacementPlugin(intlExpression, languageExp),
    new webpack.NamedChunksPlugin(),
    new webpack.NamedModulesPlugin(),
    ...(isDevelopment
      ? [new webpack.ContextReplacementPlugin(themeExpression, selectedTheme)]
      : productionPlugins),
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: false,
        sourceMap: true, // set to true if you want JS source maps
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    splitChunks: {
      chunks: isProduction ? 'all' : 'async',
      cacheGroups: {
        react: {
          name: 'react',
          test: /[\\/]node_modules[\\/](react|react-dom|react-relay|relay-runtime)[\\/]/,
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
      'react-router/lib/getRouteParams': 'react-router/es/getRouteParams',
      'react-router-relay/lib': 'react-router-relay/es',
      'react-router-relay/lib/RelayRouterContext':
        'react-router-relay/es/RelayRouterContext',
      'react-router-relay/lib/QueryAggregator':
        'react-router-relay/es/QueryAggregator',
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
