module.exports = {
  'parser': 'babel-eslint',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
  },
  'extends': 'airbnb',
  'rules': {
    'eqeqeq': [2, 'allow-null'],
    'import/no-unresolved': 0,
    'graphql/template-strings': [2, {
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
