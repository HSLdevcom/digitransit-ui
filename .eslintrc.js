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
    'import/no-unresolved': 'off',
    'graphql/template-strings': ['error', {
      'env': 'relay',
      'schemaJson': require('./build/schema.json'),
    }],
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
