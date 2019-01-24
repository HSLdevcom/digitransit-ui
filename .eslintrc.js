module.exports = {
  'parser': 'babel-eslint',
  'extends': [
    'plugin:compat/recommended',
    'plugin:jsx-a11y/recommended',
    'airbnb',
    'prettier',
    'prettier/react',
  ],
  'rules': {
    'curly': ['error', 'all'],
    // Require custom extension
    'react/jsx-filename-extension': ['error', { "extensions": [".js"] }],
    'react/jsx-key': 'error',
    'react/forbid-prop-types': ['warn', { forbid: ['any', 'array', 'object'] }],
    'react/require-default-props': 'warn',
    'jsx-a11y/anchor-is-valid': [ 'error', {
        'components': [ 'Link' ],
        'specialLink': [ 'to' ],
        'aspects': [ 'noHref', 'invalidHref', 'preferButton' ]
      }],
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/label-has-for': 'off', // deprecated in 6.1.0, does not support select tags
    'no-plusplus': ['error', { "allowForLoopAfterthoughts": true }],
    'compat/compat': 'error',
    // Enable GraphQL linting
    'graphql/template-strings': ['error', {
      'env': 'relay',
      'schemaJson': require('./build/schema.json'),
    }],
    'prettier/prettier': ['error', {
      'singleQuote': true,
      'trailingComma': 'all',
    }]
  },
  'env': {
    'browser': true,
  },
  'plugins': [
    'react',
    'graphql',
    'compat',
    'prettier',
    'jsx-a11y'
  ],
  'settings': {
    'polyfills': ['fetch', 'promises']
  }
};
