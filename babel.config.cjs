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
  plugins: ['dynamic-import-node', 'relay'],
};
