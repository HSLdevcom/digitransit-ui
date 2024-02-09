module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
          browsers: [],
        },
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    'dynamic-import-node',
    'relay',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-transform-json-strings',
  ],
};
