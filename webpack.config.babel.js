const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJsPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const OfflinePlugin = require('offline-plugin');

const CompressionPlugin = require('compression-webpack-plugin');
const iltorb = require('iltorb');
const zopfli = require('node-zopfli-es');

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
      optional: ['*.png', 'css/*.css', 'assets/*.svg', ':externals:'],
    },
    // src for google fonts might change so https://fonts.gstatic.com addresses might require
    // some maintenance in this list to still keep them cached by service worker in the future.
    externals: [
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/0F8C1F243ED488143.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/1969A9B12BA2541A9.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/205607F96BE737D19.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/30163221AEA2C586E.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/4210FA3976167A3E8.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/43B34F3B410016514.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/445F43CEB6930C6BB.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/456FB7FE570EBDA24.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/547597B7CB30750DE.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/5956DB7162C64A80A.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/5FE95BF0A1016BECE.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/60AB40F307C99A848.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/6343632725D44ED6E.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/63C85404AF69A23FF.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/6C45BB0ABE9415ED2.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/83817D19D44B86613.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/8BFF53A90D26EA4E3.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/8ED758ECB5C3BD87B.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/8F4B180DF978C6803.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/964F0DD10E960EFF6.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/9E19EE5BF5EB99BC6.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/A9DE5A1DE88C173DA.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/AD739424B4A851C01.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/AE38E35C40971EE56.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/AE7F03B766B5D1B98.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/AEFF9E2FDDA25BF5B.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/B528E04E4D7E0857A.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/BBEF9A749366CFDBE.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/BC5EFB349EBC5CCF7.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/BC9DE34EB2AC7213E.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/C96388EBD0EBAEF63.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/CA5B833E0126E5DCF.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/CC78AD0762B151DB6.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/D3B6596865752C0CC.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/D82B5BFEC1AEEB2B4.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/DFDF36DE39DE5BD5A.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/F0E1C597A9B945719.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/F240A1C413BA5E391.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/FCD8D21C112DA60B9.css',
      'https://digitransit-prod-cdn-origin.azureedge.net/fonts/684288/FD9358ADC87D92390.css',
      'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh7USSwaPGR_p.woff2',
      'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh7USSwiPGQ.woff2',
      'https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjxAwXjeu.woff2',
      'https://fonts.gstatic.com/s/lato/v16/S6uyw4BMUTPHjx4wXg.woff2',
      'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh50XSwaPGR_p.woff2',
      'https://fonts.gstatic.com/s/lato/v16/S6u9w4BMUTPHh50XSwiPGQ.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngRUXNadjH0qYEzV7ab-oWlsbCLwR26eg.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngRUXNadjH0qYEzV7ab-oWlsbCCwR26eg.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngRUXNadjH0qYEzV7ab-oWlsbCIwR26eg.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngRUXNadjH0qYEzV7ab-oWlsbCGwR0.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngSUXNadjH0qYEzV7ab-oWlsbg95AiIW_3QRQ.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngSUXNadjH0qYEzV7ab-oWlsbg95AiBW_3QRQ.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngSUXNadjH0qYEzV7ab-oWlsbg95AiLW_3QRQ.woff2',
      'https://fonts.gstatic.com/s/ptsansnarrow/v11/BngSUXNadjH0qYEzV7ab-oWlsbg95AiFW_0.woff2',
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
    algorithm: zopfli.gzip,
  }),
  new CompressionPlugin({
    filename: '[path].br[query]',
    test: /\.(js|css|html|svg|ico)$/,
    minRatio: 0.95,
    algorithm: iltorb.compress,
  }),
  new CopyWebpackPlugin([
    {
      from: path.join(__dirname, 'static/assets/geojson'),
      transform: function minify(content) {
        return JSON.stringify(JSON.parse(content.toString()));
      },
      to: path.join(__dirname, '_static/assets/geojson'),
    },
  ]),
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
