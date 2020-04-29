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
    ],
  },
  externals: [
    {
      react: 'umd react',
      'react-dom': 'umd react-dom',
    },
  ],
};
