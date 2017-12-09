module.exports = {
  'parser': 'babel-eslint',
  'extends': [
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
    'no-plusplus': ['error', { "allowForLoopAfterthoughts": true }],
    'compat/compat': 'error',
    // Enable GraphQL linting
    'graphql/template-strings': ['error', {
      'env': 'relay',
      'schemaJson': require('./build/schema.json').data,
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
    'prettier'
  ],
  'settings': {
    'polyfills': ['fetch', 'promises']
  }
};
