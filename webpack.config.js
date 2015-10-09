var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var csswring = require('csswring');

var port = process.env.HOT_LOAD_PORT || 9000;

function getLoadersConfig(env) {
  if (env === "development") {
    return([
      { test: /\.css$/, loaders: ['style', 'css', 'postcss']},
      { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' },
      { test: /\.json$/, loader: 'json'},
      { test: /\.jsx$/, loaders: ['react-hot', 'babel']},
      { test: /\.scss$/,
        loaders: [
          'style', 'css', 'postcss',
          'sass?includePaths[]=' + (path.resolve(__dirname, "./sass/themes", process.env.CONFIG ? process.env.CONFIG : 'default'))
        ]
      },
      { test: /\.(eot|png|ttf|woff)$/, loader: 'file'},
      { test: /app\/queries\.js$/, loader: 'babel', query: {stage: 0, plugins: ['./build/babelRelayPlugin']}},
    ])
  } else {
    return([
      { test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css!postcss")},
      { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' },
      { test: /\.json$/, loader: 'json'},
      { test: /\.jsx$/, loader: 'babel'},
      { test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style", 'css!postcss!sass?includePaths[]=' +
          (path.resolve(__dirname, "./sass/themes", process.env.CONFIG ? process.env.CONFIG : 'default')))
      },
      { test: /\.(eot|png|ttf|woff)$/, loader: 'file'},
      { test: /app\/queries\.js$/, loader: 'babel', query: {stage: 0, plugins: ['./build/babelRelayPlugin']}},
    ])
  }
}

function getPluginsConfig(env) {
  if (env === "development") {
    return([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fi|sv|en\-gb/),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify("development"),
          ROOT_PATH: JSON.stringify(process.env.ROOT_PATH ? process.env.ROOT_PATH : '/'),
          CONFIG: JSON.stringify(process.env.CONFIG ? process.env.CONFIG : 'default')
        }
      }),
      new webpack.NoErrorsPlugin()
    ])
  } else {
    return([
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fi|sv|en\-gb/),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify("production"),
          ROOT_PATH: JSON.stringify(process.env.ROOT_PATH ? process.env.ROOT_PATH : '/'),
          CONFIG: JSON.stringify(process.env.CONFIG ? process.env.CONFIG : 'default'),
          SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        }
      }),
      new webpack.PrefetchPlugin('react'),
      new webpack.PrefetchPlugin('react-router'),
      new webpack.PrefetchPlugin('fluxible'),
      new webpack.PrefetchPlugin('leaflet'),
      new webpack.optimize.OccurenceOrderPlugin(true),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        mangle: {
          except: ['$super', '$', 'exports', 'require', 'window']
        },
        exclude: /mapboxgl/
      }),
      new ExtractTextPlugin("css/bundle.css", {
        allChunks: true
      }),
      new webpack.NoErrorsPlugin()
    ])
  }
}

module.exports = {
  devtool: (process.env.NODE_ENV === "development") ? 'eval' : 'source-map', // This is not as dirty as it looks. It just generates source maps without being crazy slow.
  debug: (process.env.NODE_ENV === "development") ? true : false,
  cache: true,
  entry: (process.env.NODE_ENV === "development") ? [
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/dev-server',
    './app/client'
  ] : [
    './app/client'
  ],
  output: {
    path: path.join(__dirname, "_static"),
    filename: 'js/bundle.js',
    chunkFilename: 'js/[name].js',
    publicPath: (process.env.NODE_ENV === "development") ?
      'http://localhost:' + port + '/' : (process.env.ROOT_PATH != undefined) ? process.env.ROOT_PATH :
      '/'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: getPluginsConfig(process.env.NODE_ENV),
  resolve: {
    extensions: ['', '.js', '.cjsx', '.jsx', '.coffee'],
    alias: {
      leaflet$: path.resolve(__dirname, "vendor/leaflet-custom-src"),
      'react-relay': path.resolve(__dirname, "vendor/react-relay"),
    },
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
