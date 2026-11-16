const {
  rules: { 'no-restricted-properties': airbnbRestrictedProperties },
} = require('eslint-config-airbnb-base/rules/best-practices');

module.exports = {
  extends: '../../.eslintrc.cjs',
  globals: {
    // Vitest's `globals: true` (see vitest.config.js's `app` project)
    // makes these available at runtime without importing them from
    // 'vitest' - list them here so ESLint's no-undef doesn't flag them.
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    vi: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
  },
  rules: {
    // Explicit override needed: ESLint re-anchors an *inherited* override's
    // `files` globs relative to this nested config's own directory, so the
    // root config's `server/**`/`utils/{shared,server}/**` "always" override
    // spuriously matches this directory's own `test/unit/server/**` and
    // `test/unit/utils/{shared,server}/**` subtrees (same names, wrong
    // level). None of test/unit/** is native-ESM-loaded (Vite/Vitest's own
    // transform handles it all), so it always gets the "never" convention.
    'import/extensions': ['error', 'never', { ignorePackages: true }],
  },
  overrides: [
    {
      // The app project's test files share one module registry per worker
      // (vitest.config.js `isolate: false`), so a per-file module mock would
      // miss modules an earlier file already imported, and leak into later
      // files. Options replace the inherited ones, hence airbnb's are restated.
      files: ['**/*.test.js', '**/*.test.jsx'],
      excludedFiles: ['server/**', 'utils/server/**'],
      rules: {
        'no-restricted-properties': [
          ...airbnbRestrictedProperties,
          ...['mock', 'doMock', 'unmock', 'doUnmock'].map(property => ({
            object: 'vi',
            property,
            message:
              'App test files share their module registry. Stub exports with vi.spyOn() on the module namespace instead, or mock a module for every file in helpers/vitest.setup.js (see docs/Tests.md).',
          })),
        ],
      },
    },
  ],
};
