module.exports = {
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
  },
  'extends': 'airbnb',
  'rules': {
    // Require custom extension
    'react/jsx-filename-extension': ['error', { "extensions": [".js"] }],
    'react/require-default-props': 'warn',
    'react/jsx-no-bind': ['warn', {ignoreRefs: true, allowArrowFunctions: false, allowBind: false}],
    'react/jsx-key': 'error',
    // TODO: https://github.com/yannickcr/eslint-plugin-react/issues/819
    // TODO: https://github.com/yannickcr/eslint-plugin-react/issues/811
    'react/no-unused-prop-types': ['warn', { skipShapeProps: true }],
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
