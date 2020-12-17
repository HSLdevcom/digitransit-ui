const productionPlugins = [
  [
    'babel-plugin-transform-react-remove-prop-types',
    {
      mode: 'unsafe-wrap',
    },
  ],
];

module.exports = function (api) {
  api.cache(false);
  const presets = [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        modules: 'auto',
        targets: ['> 0.2% in FI', 'not op_mini all', 'not IE 11'],
      },
    ],
    ['@babel/preset-react', { useBuiltIns: true }],
  ];
  const plugins = [
    'babel-plugin-optimize-clsx',
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
      },
    ],
    ['inline-react-svg'],
  ];
  if (process.env.ENV === 'production') {
    plugins.push(...productionPlugins);
  }
  return {
    presets,
    plugins,
  };
};
