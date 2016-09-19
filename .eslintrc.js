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
    // Temporary fix for: https://github.com/babel/babel-eslint/issues/316
    'generator-star-spacing': 0,
  },
  settings: {
    'import/resolver': 'webpack',
  },
  'env': {
    'browser': true,
    'mocha': true,
    'node': true,
  },
  'plugins': [
    'react',
    'graphql',
  ],
};
