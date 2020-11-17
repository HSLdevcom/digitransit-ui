const path = require('path');

const mode = process.env.ENV;
const isProduction = mode === 'production';

module.exports = {
  mode,
  devtool: isProduction ? 'source-map' : 'eval',
  entry: {
    main: './src/index.js',
  },
  output: {
    globalObject: "typeof self !== 'undefined' ? self : this",
    filename: 'index.js',
    path: path.join(__dirname, 'lib'),
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          configFile: false,
          presets: [
            [
              '@babel/preset-env',
              {
                modules: 'auto',
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
  optimization: {
    minimize: true,
    namedModules: true,
    namedChunks: true,
    removeAvailableModules: true,
    flagIncludedChunks: true,
    occurrenceOrder: false,
    usedExports: true,
    concatenateModules: true,
    sideEffects: false,
    splitChunks: {
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
