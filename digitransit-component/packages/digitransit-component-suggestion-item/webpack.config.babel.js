module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    globalObject: "typeof self !== 'undefined' ? self : this",
    filename: 'index.generated',
    path: __dirname,
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
          presets: [['@babel/preset-react', { useBuiltIns: true }]],
          plugins: [
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            ['@babel/plugin-proposal-numeric-separator', { loose: true }],
          ],
        },
      },
      {
        test: /\.svg$/,
        loader: 'url-loader',
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
  resolve: {
    extensions: ['.js', '.scss'],
  },
  externals: [
    {
      react: 'umd react',
      'react-dom': 'umd react-dom',
    },
  ],
};
