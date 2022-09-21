const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
  new MiniCssExtractPlugin({
    filename: 'css/[name].[contenthash].css',
    chunkFilename: 'css/[name].[contenthash].css',
  }),
  new CompressionPlugin({
    filename: '[path][base].gz[query]',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
    algorithm: 'gzip',
  }),
  new CompressionPlugin({
    filename: '[path][base].br[query]',
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
            '@babel/plugin-proposal-class-properties',
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
        type: 'asset',
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
    minimize: true,
    minimizer: [
      // > use the `...` syntax to extend existing minimizers
      `...`,
      new CssMinimizerPlugin(),
    ],
    // todo
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
          test: /[\\/]node_modules[\\/](@digitransit-component|@digitransit-search-util|@digitransit-store|@digitransit-util|@hsl-fi)[\\/]/,
          reuseExistingChunk: false,
        },
      },
    },
    runtimeChunk: isProduction,
  },
  performance: { hints: false },
  cache: true,
  resolve: {
    mainFields: ['browser', 'module', 'jsnext:main', 'main'],
    fallback: {
      url: require.resolve('url'),
    },
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
    devMiddleware: {
      publicPath: '/',
    },
    compress: true,
    host: '0.0.0.0',
    port: process.env.HOT_LOAD_PORT || 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
