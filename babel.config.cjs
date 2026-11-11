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
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['dynamic-import-node', 'relay'],
};
