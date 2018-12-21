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
    [
      'relay',
      {
        compat: true,
        schema: 'build/schema.json',
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    '@babel/plugin-proposal-json-strings',
  ],
  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
};
