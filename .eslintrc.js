const fs = require('fs');
const path = require('path');

const graphqlSchemaString = fs.readFileSync(
  path.resolve(__dirname, './build/schema.graphql'),
  { encoding: 'utf-8' },
);

module.exports = {
  parser: 'babel-eslint',
  extends: [
    'plugin:compat/recommended',
    'plugin:jsx-a11y/recommended',
    'airbnb',
    'prettier',
    'prettier/react',
  ],
  rules: {
    curly: ['error', 'all'],
    'lines-between-class-members': 'warn',
    'no-else-return': 'warn',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-console': 'error',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-default': 'off',
    // react
    'react/button-has-type': 'warn',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.js', 'tsx'] }],
    'react/jsx-fragments': 'off',
    'react/jsx-key': 'error',
    'react/jsx-props-no-spreading': 'off',
    'react/forbid-prop-types': ['warn', { forbid: ['any', 'array', 'object'] }],
    'react/require-default-props': 'warn',
    'react/sort-comp': 'off',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',

    // jsx-a11y
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
    'jsx-a11y/label-has-associated-control': 'error',
    'jsx-a11y/label-has-for': 'off', // deprecated in 6.1.0, does not support select tags

    // compat
    'compat/compat': 'warn',

    // graphql
    'graphql/template-strings': [
      'error',
      {
        env: 'relay',
        schemaString: graphqlSchemaString,
        tagName: 'graphql',
      },
    ],

    // prettier
    'prettier/prettier': [
      'error',
      {
        arrowParens: 'avoid',
        endOfLine: 'auto',
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
  },
  env: {
    browser: true,
  },
  plugins: ['react', 'graphql', 'compat', 'prettier', 'jsx-a11y'],
  settings: {
    polyfills: ['fetch', 'promises'],
  },
  overrides: [
    {
      files: ['*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
