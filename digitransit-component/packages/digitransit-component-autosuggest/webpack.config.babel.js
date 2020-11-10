const path = require('path');
const webpack = require('webpack');

const mode = process.env.ENV;
const isProduction = mode === 'production';

module.exports = {
  mode,
  devtool: isProduction ? 'source-map' : 'eval',
  output: {
    globalObject: "typeof self !== 'undefined' ? self : this",
    filename: 'index.js',
    path: path.join(__dirname, 'lib'),
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
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
            ['@babel/preset-react', { useBuiltIns: true }],
          ],
          plugins: [
            [
              '@babel/plugin-transform-runtime',
              {
                helpers: true,
                regenerator: true,
                useESModules: true,
              },
            ],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            ['@babel/plugin-proposal-numeric-separator', { loose: true }],
            ['inline-react-svg'],
          ],
        },
      },
      {
        test: /\.s(a|c)ss$/,
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
