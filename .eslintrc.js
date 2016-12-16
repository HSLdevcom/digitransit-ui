module.exports = {
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
  },
  'extends': 'airbnb',
  'rules': {
    'eqeqeq': ['error', 'allow-null'],
    'no-void': 'error',
    'react/jsx-filename-extension': ['error', { "extensions": [".js"] }],
    'react/no-string-refs': 'warn',
    'react/no-find-dom-node': 'warn',
    'graphql/template-strings': ['error', {
      'env': 'relay',
      'schemaJson': require('./build/schema.json'),
    }],
    // TODO: https://github.com/yannickcr/eslint-plugin-react/issues/819
    // TODO: https://github.com/yannickcr/eslint-plugin-react/issues/811
    'react/no-unused-prop-types': ['off', { skipShapeProps: true }],
    'react/forbid-prop-types': ['warn', { forbid: ['any', 'array', 'object'] }],
    'jsx-a11y/no-static-element-interactions': 'warn',
    'no-plusplus': ['error', { "allowForLoopAfterthoughts": true }],
    // Temporary fix for: https://github.com/babel/babel-eslint/issues/316
    'generator-star-spacing': 0,
  },
  'env': {
    'browser': true,
  },
  'plugins': [
    'react',
    'graphql',
  ],
};
