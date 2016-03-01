var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var csswring = require('csswring');
var StatsPlugin = require('stats-webpack-plugin');
var fs = require("fs");

require('coffee-script/register');
var config = require('./app/config')

var port = process.env.HOT_LOAD_PORT || 9000;


function getLoadersConfig(env) {
  if (env === "development") {
    return([
      { test: /\.css$/, loaders: ['style', 'css', 'postcss']},
      { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' },
      { test: /\.json$/, loader: 'json'},
      { test: /\.jsx$/, loaders: ['react-hot', 'babel']},
      { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass']},
      { test: /\.(eot|png|ttf|woff|svg)$/, loader: 'file'},
      { test: /app(\/|\\)queries\.js$/, loader: 'babel', query: {presets: ['es2015', 'react'], plugins: ['transform-class-properties', ['transform-es2015-classes', {loose: true}], './build/babelRelayPlugin']}},
    ])
  } else {
    return([
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css!postcss")},
      { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' },
      { test: /\.json$/, loader: 'json'},
      { test: /\.jsx$/, loader: 'babel'},
      { test: /\.scss$/, loader: ExtractTextPlugin.extract("style", 'css!postcss!sass')},
      { test: /\.(eot|png|ttf|woff|svg)$/, loader: 'file'},
      { test: /app(\/|\\)queries\.js$/, loader: 'babel', query: {presets: ['es2015', 'react'], plugins: ['transform-class-properties', ['transform-es2015-classes', {loose: true}], './build/babelRelayPlugin']}},
    ])
  }
}

function getPluginsConfig(env) {
  if(!config.availableLanguages) {
    throw "availableLanguages needs to be configured in the config file";
  }
  var languageExpression = new RegExp("/" + config.availableLanguages.join('|') + "/");

  if (env === "development") {
    return([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ContextReplacementPlugin(/moment(\/|\\)locale$/, languageExpression),
      new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify("development")}}),
      new webpack.NoErrorsPlugin()
    ])
  } else {
    return([
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, languageExpression),
      new webpack.DefinePlugin({'process.env': {NODE_ENV: JSON.stringify("production")}}),
      new webpack.PrefetchPlugin('react'),
      new webpack.PrefetchPlugin('react-router'),
      new webpack.PrefetchPlugin('fluxible'),
      new webpack.PrefetchPlugin('leaflet'),
      new webpack.NamedModulesPlugin(), //TODO: Change to HashedModuleIdsPlugin
      new webpack.optimize.CommonsChunkPlugin({
        names: ['common', 'leaflet', 'manifest']
      }),
      new StatsPlugin('../stats.json', {chunkModules: true}),
      new webpack.optimize.OccurrenceOrderPlugin(true),
      //new webpack.optimize.DedupePlugin(), //TODO: crashes weirdly
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        mangle: {
          except: ['$super', '$', 'exports', 'require', 'window']
        },
      }),
      new ExtractTextPlugin("css/[name].[chunkhash].css", {
        allChunks: true
      }),
      new webpack.NoErrorsPlugin()
    ])
  }
}

function getDevelopmentEntry() {
  var entry = [
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/dev-server',
      './app/client'
    ];
  return entry;
}

function getEntry() {
  var entry = {
    main: './app/client',
    common: [ // These come from all imports in client.cjsx
      'react',
      'react-dom',
      'react-relay',
      'react-router-relay',
      'react-intl',
      'history/lib/createBrowserHistory',
      'history/lib/useBasename',
      'history/lib/useQueries',
      'fluxible-addons-react/FluxibleComponent',
      'lodash/isEqual',
      'react-tap-event-plugin',
      'react-router',
      'fluxible'
    ],
    leaflet: ['leaflet']
  };

  var directories = getDirectories("./sass/themes");
  for(var i in directories) {
    var theme = directories[i];
    var entryPath = './sass/themes/'+theme+'/main.scss';
    entry[theme+'_theme'] = [entryPath];
  }

  return entry;
}

function getDirectories(srcDirectory) {
  return fs.readdirSync(srcDirectory).filter(function(file) {
    return fs.statSync(path.join(srcDirectory, file)).isDirectory();
  });
}

module.exports = {
  devtool: (process.env.NODE_ENV === "development") ? 'eval' : 'source-map', // This is not as dirty as it looks. It just generates source maps without being crazy slow.
  debug: (process.env.NODE_ENV === "development") ? true : false,
  cache: true,
  entry: (process.env.NODE_ENV === "development") ? getDevelopmentEntry() : getEntry(),
  output: {
    path: path.join(__dirname, "_static"),
    filename: (process.env.NODE_ENV === "development") ? 'js/bundle.js': 'js/[name].[chunkhash].js',
    chunkFilename: 'js/[name].[chunkhash].js',
    publicPath: ((process.env.NODE_ENV === "development") ? 'http://localhost:' + port : (process.env.APP_PATH || '')) + '/'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: getPluginsConfig(process.env.NODE_ENV),
  resolve: {
    extensions: ['', '.js', '.cjsx', '.jsx', '.coffee'],
    alias: {},
  },
  module: {
    loaders: getLoadersConfig(process.env.NODE_ENV)
  },
  postcss: (process.env.NODE_ENV === "development") ?
    [ autoprefixer({ browsers: ['last 2 version', '> 1%', 'IE 9'] })] :
    [ autoprefixer({ browsers: ['last 2 version', '> 1%', 'IE 9'] }), csswring]
  ,
  node: {
    net: "empty",
    tls: "empty"
  },
  externals: {
    "es6-promise": "var Promise",
    "fetch": "var fetch",
    "fbjs/lib/fetch": "var fetch",
    "./fetch": "var fetch",
  },
  worker: {
    output: {
      filename: 'js/[hash].worker.js',
      chunkFilename: 'js/[id].[hash].worker.js'
    }
  }
};
