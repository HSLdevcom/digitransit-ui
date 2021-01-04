const path = require('path');
const webpack = require('webpack');

const mode = process.env.ENV;
const name = process.env.NAME;
const isProduction = mode === 'production';

module.exports = {
  mode,
  devtool: isProduction ? 'source-map' : 'eval',
  watchOptions: {
    ignored: ['files/**/*.js', 'node_modules/**'],
  },
  output: {
    globalObject: "typeof self !== 'undefined' ? self : this",
    filename: 'index.js',
    path: path.join(__dirname, name, 'lib'),
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          sourceType: 'unambiguous',
          configFile: path.resolve(__dirname, 'babel.config.js'),
        },
      },
      {
        test: /.s(a|c)ss$/,
        use: [
          'iso-morphic-style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: true,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    // load `moment/locale/fi.js`, `moment/locale/sv.js` and `moment/locale/en.js`
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /fi|sv|en/),
  ],
  optimization: {
    minimize: true,
    removeAvailableModules: true,
    flagIncludedChunks: true,
    occurrenceOrder: false,
    usedExports: true,
    concatenateModules: true,
    sideEffects: false,
    splitChunks: {
      minSize: 20000,
      cacheGroups: {
        hslFi: {
          test: /[\\/]node_modules[\\/]@hsl-fi[\\/]/,
          name: 'hsl-fi',
          chunks: isProduction ? 'all' : 'async',
          reuseExistingChunk: false,
        },
      },
    },
  },
  resolve: {
    extensions: ['.js', '.scss'],
  },
  externals: [
    {
      react: 'umd react',
      'react-dom': 'umd react-dom',
    },
  ],
  target: 'node',
};
