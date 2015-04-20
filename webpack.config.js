var path = require('path');
var webpack = require('webpack');

var port = process.env.HOT_LOAD_PORT || 9000;

module.exports = {
  devtool: (process.env.NODE_ENV === "development") ? 'eval' : undefined, // This is not as dirty as it looks. It just generates source maps without being crazy slow.
  debug: (process.env.NODE_ENV === "development") ? true : false,
  cache: true,
  entry: [
    'webpack-dev-server/client?http://localhost:' + port,
    'webpack/hot/dev-server',
    './app/client'
  ],
  output: {
    path: path.join(__dirname, "_static"),
    filename: 'bundle.js',
    publicPath: 'http://localhost:' + port + '/js/'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: ['', '.js', '.cjsx', '.coffee', '.eot', '.woff', '.ttf', '.png']
  },
  module: {
    loaders: [
      { test: /\.css$/, loaders: ['style', 'css']},
      { test: /\.cjsx$/, loaders: ['react-hot', 'coffee', 'cjsx']},
      { test: /\.coffee$/, loader: 'coffee' },
      { test: /\.scss$/, loaders: ['style', 'css', 'sass']},
      { test: /\.(eot|png|ttf|woff)$/, loader: 'file'}
    ]
  }
};