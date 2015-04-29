var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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
    publicPath: 'http://localhost:' + port + '/'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: (process.env.NODE_ENV === "development") ? [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.NoErrorsPlugin()
  ] : [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.DefinePlugin({
      "process.env": {
          NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
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
      (process.env.NODE_ENV === "development") ? { test: /\.css$/, loaders: ['style', 'css']} : { test: /\.css$/, loader: ExtractTextPlugin.extract("style", "css")},
      { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' },
      { test: /\.jsx$/, loafers: ['react-hot', 'jsx']},
      (process.env.NODE_ENV === "development") ? { test: /\.scss$/, loaders: ['style', 'css', 'sass']} : { test: /\.scss$/, loader: ExtractTextPlugin.extract("style", "css!sass-loader")},
      { test: /\.(eot|png|ttf|woff)$/, loader: 'file'}
    ]
  }
};