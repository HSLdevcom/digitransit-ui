/* eslint-disable import/no-extraneous-dependencies, global-require, prefer-template,
   import/no-dynamic-require
*/

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const csswring = require('csswring');
const StatsPlugin = require('stats-webpack-plugin');
// const OptimizeJsPlugin = require('optimize-js-plugin');
const OfflinePlugin = require('offline-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const GzipCompressionPlugin = require('compression-webpack-plugin');
const BrotliCompressionPlugin = require('brotli-webpack-plugin');
const fs = require('fs');

require('babel-core/register')({
  presets: [['env', { targets: { node: 'current' } }], 'stage-2', 'react'],
  plugins: [
    'transform-system-import-commonjs',
    path.join(process.cwd(), 'build/babelRelayPlugin'),
  ],
  ignore: [
    /node_modules/,
    'app/util/piwik.js',
  ],
});

const port = process.env.HOT_LOAD_PORT || 9000;

const devBrowsers = ['edge 14', 'last 1 chrome version', 'Firefox ESR', 'safari 9'];

const prodBrowsers = ['IE 10', '> 0.3% in FI', 'last 2 versions'];

function getDevBrowsers() {
  return process.env.USE_PROD_BROWSERS ? prodBrowsers : devBrowsers;
}

function getRulesConfig(env) {
  if (env === 'development') {
    return ([
      { test: /\.css$/, loaders: ['style', 'css', 'postcss'] },
      { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass'] },
      { test: /\.(eot|png|ttf|woff|svg)$/, loader: 'file' },
      { test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        options: {
          presets: [
            ['env', { targets: { browsers: getDevBrowsers() }, modules: false }],
            'react',
            'stage-2',
          ],
          plugins: [
            'transform-system-import-commonjs',
            path.join(__dirname, 'build/babelRelayPlugin'),
            ['transform-runtime', {
              helpers: true,
              polyfill: false,
              regenerator: true,
            }],
          ],
          ignore: [
            'app/util/piwik.js',
          ],
        },
      },
    ]);
  }
  return ([
    { test: /\.css$/, loader: ExtractTextPlugin.extract('css!postcss') },
    { test: /\.scss$/, loader: ExtractTextPlugin.extract('css!postcss!sass') },
    { test: /\.(eot|png|ttf|woff|svg)$/, loader: 'url-loader?limit=10000' },
    { test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      options: {
        // loose is needed by older Androids < 4.3 and IE10
        presets: [
          ['env', { targets: { browsers: prodBrowsers }, loose: true, modules: false }],
          'react',
          'stage-2',
        ],
        plugins: [
          'transform-react-remove-prop-types',
          path.join(__dirname, 'build/babelRelayPlugin'),
          ['transform-runtime', {
            helpers: true,
            polyfill: false,
            regenerator: true,
          }],
        ],
        ignore: [
          'app/util/piwik.js',
        ],
      },
    },
  ]);
}

function getAllPossibleLanguages() {
  const srcDirectory = 'app';
  return fs.readdirSync(srcDirectory)
    .filter(file => /^config\.\w+\.js$/.test(file))
    .filter(file => !/^config\.client\.js$/.test(file))
    .map(file => require('./' + srcDirectory + '/' + file).default.availableLanguages)
    .reduce((languages, languages2) => languages.concat(languages2))
    .filter((language, position, languages) => languages.indexOf(language) === position);
}

function getSourceMapPlugin(testPattern, prefix) {
  return new webpack.SourceMapDevToolPlugin({
    test: testPattern,
    filename: '[file].map',
    append: '\n//# sourceMappingURL=' + prefix + '[url]',
    module: true,
    columns: true,
    lineToLine: false,
  });
}

function printDevModeWarning() {
  /* eslint-disable no-console */
  console.log('\n************* NOTICE ***************');
  console.log('dev mode does not support all browsers');
  console.log(`currently supported are: ${getDevBrowsers()}`);
  console.log('************************************\n');
  /* eslint-enable no-console */
}

function getPluginsConfig(env) {
  const languageExpression = new RegExp('^./(' + getAllPossibleLanguages().join('|') + ')$');
  const momentExpression = /moment[/\\]locale$/;
  const reactIntlExpression = /react-intl[/\\]locale-data$/;
  const intlExpression = /intl[/\\]locale-data[/\\]jsonp$/;
  const themeExpression = /sass[/\\]themes$/;
  const selectedTheme = new RegExp(`^./(${process.env.CONFIG || 'default'})/main.scss$`);

  if (env === 'development') {
    printDevModeWarning();
    return ([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ContextReplacementPlugin(momentExpression, languageExpression),
      new webpack.ContextReplacementPlugin(reactIntlExpression, languageExpression),
      new webpack.ContextReplacementPlugin(intlExpression, languageExpression),
      new webpack.ContextReplacementPlugin(themeExpression, selectedTheme),
      new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('development') } }),
      new webpack.LoaderOptionsPlugin({
        debug: true,
        options: {
          postcss: () => [autoprefixer({ browsers: getDevBrowsers() })],
        },
      }),
      new webpack.NoErrorsPlugin(),
    ]);
  }
  return ([
    new webpack.ContextReplacementPlugin(momentExpression, languageExpression),
    new webpack.ContextReplacementPlugin(reactIntlExpression, languageExpression),
    new webpack.ContextReplacementPlugin(intlExpression, languageExpression),
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } }),
    new webpack.HashedModuleIdsPlugin({ hashDigestLength: 6 }),
    new WebpackMd5Hash(),
    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
      options: {
        postcss: () => [autoprefixer({ browsers: prodBrowsers }), csswring],
      },
    }),
    getSourceMapPlugin(/\.(js)($|\?)/i, '/js/'),
    getSourceMapPlugin(/\.(css)($|\?)/i, '/css/'),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common', 'leaflet', 'manifest'],
    }),
    new webpack.optimize.AggressiveMergingPlugin({ minSizeReduce: 1.2 }),
    new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 60000 }),
    new StatsPlugin('../stats.json', { chunkModules: true }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
        screw_ie8: true,
        negate_iife: false,
      },
      mangle: {
        except: ['$super', '$', 'exports', 'require', 'window'],
      },
    }),
    // TODO: add after https://github.com/vigneshshanmugam/optimize-js-plugin/issues/7 is shipped
    // new OptimizeJsPlugin({
    //   sourceMap: true,
    // }),
    new ExtractTextPlugin({
      filename: 'css/[name].[contenthash].css',
      allChunks: true,
    }),
    new OfflinePlugin({
      excludes: ['**/.*', '**/*.map', '../stats.json', '**/*.gz', '**/*.br'],
      // TODO: Can be enabled after cors headers have been added
      // externals: ['https://dev.hsl.fi/tmp/452925/86FC9FC158618AB68.css'],
      caches: {
        main: [':rest:'],
        additional: [
          ':externals:',
          'js/+([a-z0-9]).js',
          // TODO: move the ones below back to optional after caching has been fixed.
          'css/*.css',
          '*.svg',
        ],
        optional: ['js/*_theme.*.js', 'js/*_sprite.*.js', '*.png'],
      },
      externals: ['/'],
      safeToUseOptionalCaches: true,
      ServiceWorker: {
        entry: './app/util/font-sw.js',
      },
      AppCache: {
        caches: ['main', 'additional', 'optional'],
      },
    }),
    new GzipCompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'zopfli',
      test: /\.(js|css|html|svg)$/,
      minRatio: 0.95,
    }),
    new BrotliCompressionPlugin({
      asset: '[path].br[query]',
      test: /\.(js|css|html|svg)$/,
      minRatio: 0.95,
    }),
    new webpack.NoErrorsPlugin(),
  ]);
}

function getDirectories(srcDirectory) {
  return fs.readdirSync(srcDirectory).filter(file =>
    fs.statSync(path.join(srcDirectory, file)).isDirectory() // eslint-disable-line comma-dangle
  );
}

function getDevelopmentEntry() {
  const entry = [
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/dev-server',
    './app/client',
  ];
  return entry;
}

function getEntry() {
  const entry = {
    common: [ // These come from all imports in client.js
      'react',
      'react-dom',
      'react-relay',
      'react-tap-event-plugin',
      'moment',
    ],
    leaflet: ['leaflet'],
    main: './app/client',
  };

  const directories = getDirectories('./sass/themes');
  directories.forEach((theme) => {
    const entryPath = './sass/themes/' + theme + '/main.scss';
    entry[theme + '_theme'] = [entryPath];
  });

  directories.forEach((theme) => {
    const entryPath = './static/svg-sprite.' + theme + '.svg';
    entry[theme + '_sprite'] = [entryPath];
  });

  return entry;
}

module.exports = {
  // prod mode sourcemaps are hand defined in plugins.
  devtool: (process.env.NODE_ENV === 'development') ? 'eval' : false,
  cache: true,
  entry: (process.env.NODE_ENV === 'development') ? getDevelopmentEntry() : getEntry(),
  output: {
    path: path.join(__dirname, '_static'),
    filename: (process.env.NODE_ENV === 'development') ?
      'js/bundle.js' : 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[chunkhash].js',
    publicPath: ((process.env.NODE_ENV === 'development') ?
      'http://localhost:' + port : (process.env.APP_PATH || '')) + '/',
  },
  plugins: getPluginsConfig(process.env.NODE_ENV),
  resolve: {
    mainFields: ['browser', 'module', 'jsnext:main', 'main'],
    alias: {
      'lodash.merge': 'lodash/merge',
      'history/lib/Actions': 'history/es6/Actions',
      'history/lib/createBrowserHistory': 'history/es6/createBrowserHistory',
      'history/lib/createHashHistory': 'history/es6/createHashHistory',
      'history/lib/createMemoryHistory': 'history/es6/createMemoryHistory',
      'history/lib/useBasename': 'history/es6/useBasename',
      'history/lib/useQueries': 'history/es6/useQueries',
      'react-router/lib/getRouteParams': 'react-router/es6/getRouteParams',
      moment$: 'moment/moment.js',
    },
  },
  resolveLoader: {
    moduleExtensions: ['-loader'],
  },
  module: {
    rules: getRulesConfig(process.env.NODE_ENV),
  },
  node: {
    net: 'empty',
    tls: 'empty',
  },
  externals: {
    'core-js/library/fn/symbol': 'var Symbol',
    'core-js/library/fn/object/assign': 'var Object.assign',
    'core-js/library/fn/weak-map': 'var WeakMap',
    'core-js/library/es6/map': 'var Map',
    'core-js/library/fn/promise': 'var Promise',
    'core-js/library/fn/array/from': 'var Array.from',
    'core-js/library/fn/object/keys': 'var Object.keys',
    'core-js/library/fn/object/freeze': 'var Object.freeze',
    'core-js/library/fn/object/get-prototype-of': 'var Object.getPrototypeOf',
    'core-js/library/fn/object/set-prototype-of': 'var Object.setPrototypeOf',
    'core-js/library/fn/object/define-property': 'var Object.defineProperty',
    'core-js/library/fn/json/stringify': 'var JSON.stringify',
    'core-js/library/fn/object/create': 'var Object.create',
    'core-js/library/fn/symbol/iterator': 'var Symbol.iterator',
    'fbjs/lib/fetch': 'var fetch',
    './fetch': 'var fetch',
    'object-assign': 'var Object.assign',
  },
  performance: {
    hints: (process.env.NODE_ENV === 'development') ? false : 'warning',
  },
};
