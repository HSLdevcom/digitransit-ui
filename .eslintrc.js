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
    'lines-between-class-members': 'off',
    'no-alert': 'error',
    'no-else-return': 'error',
    'no-plusplus': ['error', { "allowForLoopAfterthoughts": true }],
    'no-console': 'error',
    'func-names': 'off',
    // react
    'react/button-has-type': 'off',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': ['error', { "extensions": [".js"] }],
    'react/jsx-key': 'error',
    'react/forbid-foreign-prop-types': 'off',
    'react/forbid-prop-types': ['off', { forbid: ['any', 'array', 'object'] }],
    'react/require-default-props': 'off',
    
    // jsx-a11y
    'jsx-a11y/anchor-is-valid': [ 'error', {
        'components': [ 'Link' ],
        'specialLink': [ 'to' ],
        'aspects': [ 'noHref', 'invalidHref', 'preferButton' ]
      }],
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/label-has-for': 'off', // deprecated in 6.1.0, does not support select tags
    
    // compat
    'compat/compat': 'error',
    
    // graphql
    'graphql/template-strings': ['error', {
      'env': 'relay',
      'schemaJson': require('./build/schema.json'),
    }],

    // prettier
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
