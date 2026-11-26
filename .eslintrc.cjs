// Extended below instead of replaced, so Airbnb's entries keep applying.
const airbnbRestrictedSyntax = require('eslint-config-airbnb-base/rules/style').rules[
  'no-restricted-syntax'
];

const BROWSER_URL_MESSAGE =
  'Use match.location for app logic, or router.createHref for the browser URL.';

module.exports = {
  parser: '@babel/eslint-parser',
  reportUnusedDisableDirectives: true,
  extends: [
    'plugin:compat/recommended',
    'plugin:jsx-a11y/recommended',
    'airbnb',
    'plugin:prettier/recommended',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    curly: ['error', 'all'],
    'lines-between-class-members': 'warn',
    'no-else-return': 'warn',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-console': 'error',
    'no-restricted-exports': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/no-named-default': 'off',
    'import/extensions': ['error', 'never', { ignorePackages: true }],
    'import/prefer-default-export': 'off',
    // uuid has only an exports map, which eslint-import-resolver-node does not support
    'import/no-unresolved': ['error', { commonjs: true, caseSensitive: true, ignore: ['^uuid$'] }],
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/server/**/*',
            from: './src/client/**/*',
            message:
              'src/server/** must not import client-only code. Put cross-cutting code in src/shared/** instead.',
          },
          {
            target: './src/client/**/*',
            from: './src/server/**/*',
            message:
              'src/client/** must not import server-only code. Put cross-cutting code in src/shared/** instead.',
          },
          {
            target: './src/shared/**/*',
            from: ['./src/client/**/*', './src/server/**/*'],
            message:
              'src/shared/** must only depend on other src/shared/** code (or external packages) so it stays safely importable by both server and client.',
          },
          {
            target: './src/client/utils/**/*',
            from: './src/client',
            except: ['./utils'],
            message:
              'src/client/utils/** must not import the rest of src/client/**; keep dependencies flowing from the client to its utilities.',
          },
        ],
      },
    ],
    // react
    'react/button-has-type': 'warn',
    'react/destructuring-assignment': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx'] }],
    'react/jsx-fragments': 'off',
    'react/jsx-key': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/forbid-prop-types': ['warn', { forbid: ['any', 'array', 'object'] }],
    'react/require-default-props': 'off',
    'react/sort-comp': 'off',
    'react/state-in-constructor': 'off',
    'react/static-property-placement': 'off',
    'react/function-component-definition': 'off',

    // jsx-a11y
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
        aspects: ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
    'jsx-a11y/label-has-associated-control': 'off', // this has a bug with FormattedMessage
    'jsx-a11y/label-has-for': 'off', // deprecated in 6.1.0, does not support select tags
    'jsx-a11y/control-has-associated-label': 'off', // this has a bug with FormattedMessage

    // compat
    'compat/compat': 'warn',

    // prettier
    'prettier/prettier': 'error', // options in package.json "prettier"
  },
  env: { browser: true },
  plugins: ['react', 'react-hooks', 'compat', 'prettier', 'jsx-a11y'],
  overrides: [
    {
      // These files/directories are loaded by Node directly as native ESM
      // (no bundler/transpiler in between - webpack/Babel/Vitest are all
      // extension-agnostic and cover everything else), so relative imports
      // here *must* keep an explicit extension or Node's ESM loader fails.
      files: ['src/server/**/*.js', 'src/shared/**/*.js', 'webpack.config.js', 'scripts/**/*.js'],
      rules: { 'import/extensions': ['error', 'always', { ignorePackages: true }] },
    },
    {
      // Server-only code and dev scripts run in Node: logging to the console
      // is legitimate there, and browser-compatibility checks don't apply.
      files: ['src/server/**/*.js', 'scripts/**/*.js'],
      rules: { 'no-console': 'off', 'compat/compat': 'off' },
    },
    {
      // Client code reads the router location: match.location for app logic,
      // router.createHref for a real URL.
      files: ['src/client/**/*.{js,jsx}'],
      rules: {
        'no-restricted-syntax': [
          ...airbnbRestrictedSyntax,
          // Reads of the browser URL; assigning `window.location.href` navigates and is fine.
          {
            selector:
              "MemberExpression[object.object.name=/^(window|document)$/][object.property.name='location'][property.name=/^(pathname|search|href)$/]:not(AssignmentExpression > MemberExpression.left)",
            message: BROWSER_URL_MESSAGE,
          },
          {
            selector:
              "VariableDeclarator[init.object.name=/^(window|document)$/][init.property.name='location'] > ObjectPattern > Property[key.name=/^(pathname|search|href)$/]",
            message: BROWSER_URL_MESSAGE,
          },
        ],
      },
    },
    { files: ['*.js', '*.jsx'], processor: '@graphql-eslint/graphql' },
    {
      files: ['*.graphql'],
      extends: ['plugin:@graphql-eslint/operations-recommended', 'plugin:@graphql-eslint/relay'],
      // Available rules can be found at https://the-guild.dev/graphql/eslint/rules/naming-convention
      rules: {
        '@graphql-eslint/no-deprecated': 'warn',
        // Recommended naming conventions have some clashes with relay conventions
        '@graphql-eslint/naming-convention': ['error', { VariableDefinition: 'camelCase' }],
        // Relay directives caused errors and ignoring them didn't work for some reason
        '@graphql-eslint/known-directives': 'off',

        // These require parserOptions.operations to be defined
        // but haven't been able to figure out if it is possible
        // to define them with relay
        '@graphql-eslint/known-fragment-names': 'off',
        '@graphql-eslint/no-one-place-fragments': 'off',
        '@graphql-eslint/no-undefined-variables': 'off',
        '@graphql-eslint/no-unused-fragments': 'off',
        '@graphql-eslint/no-unused-variables': 'off',
        '@graphql-eslint/require-id-when-available': 'off',
        '@graphql-eslint/require-import-fragment': 'off',
        '@graphql-eslint/selection-set-depth': 'off',
        '@graphql-eslint/unique-fragment-name': 'off',
        '@graphql-eslint/unique-operation-name': 'off',
      },
      parserOptions: { schema: './packages/private/schema/schema.graphql' },
    },
  ],
};
