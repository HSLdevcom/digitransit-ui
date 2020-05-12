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
