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
          ],
          plugins: [
            ['relay', { compat: true, schema: 'schema.json' }],
            [
              '@babel/plugin-transform-runtime',
              {
                helpers: true,
                regenerator: true,
                useESModules: true,
              },
            ],
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  target: 'node',
};
