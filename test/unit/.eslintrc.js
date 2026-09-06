module.exports = {
  extends: '../../.eslintrc.js',
  // ESLint 8 has no built-in `vitest` env; `globals: true` in
  // config/vitest.config.js exposes these as real globals in every test file.
  globals: {
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    vi: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
  },
};
