var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer-core');
var csswring = require('csswring');

var port = process.env.HOT_LOAD_PORT || 9000;



module.exports = {
  devtool: (process.env.NODE_ENV === "development") ? 'eval' : undefined, // This is not as dirty as it looks. It just generates source maps without being crazy slow.
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
    chunkFilename: 'js/[id].js',
    publicPath: (process.env.NODE_ENV === "development") ? 'http://localhost:' + port + '/' : (process.env.ROOT_PATH != undefined) ? process.env.ROOT_PATH : '/'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: (process.env.NODE_ENV === "development") ? [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fi|sv|en/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify("development"),
        ROOT_PATH: JSON.stringify(process.env.ROOT_PATH ? process.env.ROOT_PATH : '/'),
        CONFIG: JSON.stringify(process.env.CONFIG ? process.env.CONFIG : 'default')
      }
    }),
    new webpack.NoErrorsPlugin()
  ] : [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /fi|sv|en/),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify("production"),
        ROOT_PATH: JSON.stringify(process.env.ROOT_PATH ? process.env.ROOT_PATH : '/'),
        CONFIG: JSON.stringify(process.env.CONFIG ? process.env.CONFIG : 'default')
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
          except: ['$super', '$', 'exports', 'require']
        }
      }),
    new ExtractTextPlugin("css/bundle.css", {
            allChunks: true
        }),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.cjsx', '.jsx', '.coffee']
  },
  module: {
    loaders: [
      //{ test: /\/app\/page\/.*\.cjsx$/, loader: 'react-router-proxy' },
      (process.env.NODE_ENV === "development") ? { test: /\.css$/, loaders: ['style', 'css', 'postcss']} : { test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css!postcss")},
      (process.env.NODE_ENV === "development") ? { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']} : { test: /\.cjsx$/, loaders: ['coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' },
      (process.env.NODE_ENV === "development") ? { test: /\.jsx$/, loaders: ['react-hot', 'jsx']} : { test: /\.jsx$/, loader: 'jsx'},
      (process.env.NODE_ENV === "development") ? { test: /\.scss$/, loaders: ['style', 'css', 'postcss', 'sass']} : { test: /\.scss$/, loader: ExtractTextPlugin.extract("style", "css!postcss!sass")},
      { test: /\.(eot|png|ttf|woff)$/, loader: 'file'}
    ]
  },
  postcss: (process.env.NODE_ENV === "development") ? [ autoprefixer({ browsers: ['last 2 version', '> 1%', 'IE 9'] })] : [ autoprefixer({ browsers: ['last 2 version', '> 1%', 'IE 9'] }), csswring],
  node: {
    net: "empty",
    tls: "empty"
  }
};
