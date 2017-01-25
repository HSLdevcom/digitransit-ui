module.exports = {
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
  },
  'extends': 'airbnb',
  'rules': {
    'react/jsx-filename-extension': ['error', { "extensions": [".js"] }],
    'react/no-string-refs': 'warn',
    'react/no-find-dom-node': 'warn',
    // TODO: https://github.com/yannickcr/eslint-plugin-react/issues/819
    // TODO: https://github.com/yannickcr/eslint-plugin-react/issues/811
    'react/no-unused-prop-types': ['off', { skipShapeProps: true }],
    'react/forbid-prop-types': ['warn', { forbid: ['any', 'array', 'object'] }],
    'react/require-default-props': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'no-plusplus': ['error', { "allowForLoopAfterthoughts": true }],
    'compat/compat': 'error',
    // Enable GraphQL linting
    'graphql/template-strings': ['error', {
      'env': 'relay',
      'schemaJson': require('./build/schema.json'),
    }],
  },
  'env': {
    'browser': true,
  },
  'plugins': [
    'react',
    'graphql',
    'compat',
  ],
  'settings': {
    'polyfills': ['fetch']
  }
};
