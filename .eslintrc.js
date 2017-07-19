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
    'polyfills': ['fetch']
  }
};
