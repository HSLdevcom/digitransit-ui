const {
  rules: { 'no-restricted-properties': airbnbRestrictedProperties },
} = require('eslint-config-airbnb-base/rules/best-practices');

module.exports = {
  extends: '../../.eslintrc.cjs',
  globals: {
    // Vitest's `globals: true` (see vitest.config.js's `client` project)
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
  overrides: [
    {
      // The client project's test files share one module registry per worker
      // (vitest.config.js `isolate: false`), so a per-file module mock would
      // miss modules an earlier file already imported, and leak into later
      // files. Options replace the inherited ones, hence airbnb's are restated.
      files: ['**/*.test.js', '**/*.test.jsx'],
      excludedFiles: ['server/**'],
      rules: {
        'no-restricted-properties': [
          ...airbnbRestrictedProperties,
          ...['mock', 'doMock', 'unmock', 'doUnmock'].map(property => ({
            object: 'vi',
            property,
            message:
              'Client test files share their module registry. Stub exports with vi.spyOn() on the module namespace instead, or mock a module for every file in helpers/vitest.setup.js (see docs/Tests.md).',
          })),
        ],
      },
    },
  ],
};
