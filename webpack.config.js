/* eslint-disable import/no-extraneous-dependencies, global-require, prefer-template,
   import/no-dynamic-require
*/

const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const flexbugsFixes = require('postcss-flexbugs-fixes');
const csswring = require('csswring');
const StatsPlugin = require('stats-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const NameAllModulesPlugin = require('name-all-modules-plugin');
const ZopfliCompressionPlugin = require('zopfli-webpack-plugin');
const BrotliCompressionPlugin = require('brotli-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin');
const fs = require('fs');

require('babel-core/register')({
  presets: [['env', { targets: { node: 'current' } }], 'stage-2', 'react'],
  plugins: [
    'dynamic-import-node',
    ['relay', { compat: true, schema: 'build/schema.json' }],
  ],
  ignore: [/node_modules/],
});

const port = process.env.HOT_LOAD_PORT || 9000;

function getRulesConfig(env) {
  if (env === 'development') {
    return [
      { test: /\.css$/, loaders: ['style', 'css', 'postcss'] },
      { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass'] },
      { test: /\.(eot|png|ttf|woff|svg)$/, loader: 'file' },
      {
        test: /\.js$/,
        loader: 'babel',
        include: [path.resolve(__dirname, 'app/')],
        options: {
          presets: [['env', { modules: false }], 'react', 'stage-2'],
          plugins: [
            'transform-import-commonjs',
            ['relay', { compat: true, schema: 'build/schema.json' }],
            [
              'transform-runtime',
              {
                helpers: true,
                polyfill: false,
                regenerator: true,
              },
            ],
          ],
        },
      },
    ];
  }
  return [
    { test: /\.css$/, loader: ExtractTextPlugin.extract('css!postcss') },
    { test: /\.scss$/, loader: ExtractTextPlugin.extract('css!postcss!sass') },
    { test: /\.(eot|png|ttf|woff|svg)$/, loader: 'url-loader?limit=10000' },
    {
      test: /\.js$/,
      loader: 'babel',
      include: [path.resolve(__dirname, 'app/')],
      options: {
        // loose is needed by older Androids < 4.3 and IE10
        presets: [
          [
            'env',
            {
              loose: true,
              modules: false,
            },
          ],
          'react',
          'stage-2',
        ],
        plugins: [
          'transform-react-remove-prop-types',
          ['relay', { compat: true, schema: 'build/schema.json' }],
          [
            'transform-runtime',
            {
              helpers: true,
              polyfill: false,
              regenerator: true,
            },
          ],
        ],
      },
    },
  ];
}

function getAllConfigs() {
  if (process.env.CONFIG && process.env.CONFIG !== '') {
    return [require('./app/config').getNamedConfiguration(process.env.CONFIG)];
  }

  const srcDirectory = 'app/configurations';
  return fs
    .readdirSync(srcDirectory)
    .filter(file => /^config\.\w+\.js$/.test(file))
    .map(file => {
      const theme = file.replace('config.', '').replace('.js', '');
      return require('./app/config').getNamedConfiguration(theme);
    });
}

function getAllPossibleLanguages() {
  return getAllConfigs()
    .map(config => config.availableLanguages)
    .reduce((languages, languages2) => languages.concat(languages2))
    .filter(
      (language, position, languages) =>
        languages.indexOf(language) === position,
    );
}

function faviconPluginFromConfig(config) {
  let logo =
    config.favicon || './sass/themes/' + config.CONFIG + '/favicon.png';
  if (!fs.existsSync(logo)) {
    logo = './sass/themes/default/favicon.png';
  }

  return new FaviconsWebpackPlugin({
    // Your source logo
    logo,
    // The prefix for all image files (might be a folder or a name)
    prefix: `icons-${config.CONFIG}-[hash]/`,
    // Emit all stats of the generated icons
    emitStats: true,
    // The name of the json containing all favicon information
    statsFilename: 'iconstats-' + config.CONFIG + '.json',
    // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
    // This matches the application background color
    background: '#eef1f3',
    theme_color: config.colors ? config.colors.primary : '#eef1f3',
    // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
    title: config.title,
    appName: config.title,
    appDescription: config.meta.description,

    // which icons should be generated (see https://github.com/haydenbleasel/favicons#usage)
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: true,
      coast: true,
      favicons: true,
      firefox: true,
      opengraph: true,
      twitter: true,
      yandex: true,
      windows: true,
    },
  });
}

function getAllFaviconPlugins() {
  return getAllConfigs().map(faviconPluginFromConfig);
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

function getPluginsConfig(env) {
  const languageExpression = new RegExp(
    '^./(' + getAllPossibleLanguages().join('|') + ')$',
  );
  const momentExpression = /moment[/\\]locale$/;
  const reactIntlExpression = /react-intl[/\\]locale-data$/;
  const intlExpression = /intl[/\\]locale-data[/\\]jsonp$/;
  const themeExpression = /sass[/\\]themes$/;
  const selectedTheme = new RegExp(
    `^./(${process.env.CONFIG || 'default'})/main.scss$`,
  );

  const commonPlugins = [
    new webpack.ContextReplacementPlugin(momentExpression, languageExpression),
    new webpack.ContextReplacementPlugin(
      reactIntlExpression,
      languageExpression,
    ),
    new webpack.ContextReplacementPlugin(intlExpression, languageExpression),
    new webpack.NamedChunksPlugin(),
    new webpack.NamedModulesPlugin(),
    new RelayCompilerWebpackPlugin({
      schema: path.resolve(__dirname, './build/schema.json'),
      src: path.resolve(__dirname, './app'),
    }),
  ];

  if (env === 'development') {
    return [
      new webpack.HotModuleReplacementPlugin(),
      ...commonPlugins,
      new webpack.ContextReplacementPlugin(themeExpression, selectedTheme),
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify('development') },
      }),
      new webpack.LoaderOptionsPlugin({
        debug: true,
        options: {
          postcss: () => [autoprefixer(), flexbugsFixes],
        },
      }),
      new webpack.NoEmitOnErrorsPlugin(),
    ];
  }
  return [
    ...commonPlugins,
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify('production') },
    }),
    new NameAllModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
      options: {
        postcss: () => [autoprefixer(), csswring, flexbugsFixes],
      },
    }),
    getSourceMapPlugin(/\.(js)($|\?)/i, '/js/'),
    getSourceMapPlugin(/\.(css)($|\?)/i, '/css/'),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common', 'manifest'],
      minChunks: Infinity,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'main',
      children: true,
      async: 'shared',
      minChunks: 3,
    }),
    new webpack.optimize.AggressiveMergingPlugin({ minSizeReduce: 1.5 }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new StatsPlugin('../stats.json', { chunkModules: true }),
    new ManifestPlugin({ fileName: '../manifest.json' }),
    new UglifyJsPlugin({
      sourceMap: true,
      parallel: true,
    }),
    ...getAllFaviconPlugins(),
    new ExtractTextPlugin({
      filename: 'css/[name].[contenthash].css',
      allChunks: true,
    }),
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
        optional: ['*.png', 'css/*.css', '*.svg', 'icons-*/*'],
      },
      // TODO: Can be enabled after cors headers have been added
      // externals: ['https://dev.hsl.fi/tmp/452925/86FC9FC158618AB68.css'],
      externals: ['/'],
      updateStrategy: 'changed',
      autoUpdate: 1000 * 60,
      safeToUseOptionalCaches: true,
      ServiceWorker: {
        entry: './app/util/font-sw.js',
        events: true,
        navigateFallbackURL: '/',
      },
      AppCache: {
        caches: ['main', 'additional', 'optional'],
      },
      version: '[hash]',
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
    new webpack.NoEmitOnErrorsPlugin(),
  ];
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
    common: [
      // These come from all imports in client.js
      'react',
      'react-dom',
      'react-relay/classic',
      'moment',
    ],
    main: './app/client',
  };

  const addEntry = (theme, sprites) => {
    let themeCss = './sass/themes/' + theme + '/main.scss';
    if (!fs.existsSync(themeCss)) {
      themeCss = './sass/themes/default/main.scss';
    }
    entry[theme + '_theme'] = [themeCss];
    entry[sprites] = ['./static/' + sprites];
  };

  if (process.env.CONFIG && process.env.CONFIG !== '') {
    const config = require('./app/config').getNamedConfiguration(
      process.env.CONFIG,
    );

    addEntry('default');
    addEntry(process.env.CONFIG, config.sprites);
  } else {
    getAllConfigs().forEach(config => {
      addEntry(config.CONFIG, config.sprites);
    });
  }

  return entry;
}

module.exports = {
  // prod mode sourcemaps are hand defined in plugins.
  devtool: process.env.NODE_ENV === 'development' ? 'eval' : false,
  cache: true,
  entry:
    process.env.NODE_ENV === 'development' ? getDevelopmentEntry() : getEntry(),
  output: {
    path: path.join(__dirname, '_static'),
    filename:
      process.env.NODE_ENV === 'development'
        ? 'js/bundle.js'
        : 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[chunkhash].js',
    publicPath:
      (process.env.NODE_ENV === 'development'
        ? '/proxy'
        : process.env.APP_PATH || '') + '/',
  },
  plugins: getPluginsConfig(process.env.NODE_ENV),
  resolve: {
    mainFields: ['browser', 'module', 'jsnext:main', 'main'],
    alias: {
      'lodash.merge': 'lodash-es/merge',
      'react-router/lib/getRouteParams': 'react-router/es/getRouteParams',
      'react-router-relay/lib': 'react-router-relay/es',
      'react-router-relay/lib/RelayRouterContext':
        'react-router-relay/es/RelayRouterContext',
      'react-router-relay/lib/QueryAggregator':
        'react-router-relay/es/QueryAggregator',
      moment$: 'moment/moment.js',
      lodash: 'lodash-es',
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
    'fbjs/lib/fetch': 'var fetch',
    './fetch': 'var fetch',
    'fbjs/lib/Map': 'var Map',
    'object-assign': 'var Object.assign',
    'simple-assign': 'var Object.assign',
  },
  performance: {
    hints: false,
  },
};
