module.exports = {
  extends: '../../.eslintrc.cjs',
  env: {
    mocha: true,
  },
  globals: {
    expect: true,
  },
  rules: {
    // test/unit/** isn't being renamed to .jsx or extension-enforced in this
    // pass (it's on a separate, unmerged Mocha->Vitest migration branch) -
    // pin these back to the pre-rename settings so it doesn't start failing
    // lint once the root config above tightens them.
    'react/jsx-filename-extension': ['error', { extensions: ['.js'] }],
    // Explicit override needed: ESLint re-anchors an *inherited* override's
    // `files` globs relative to this nested config's own directory, so the
    // root config's `server/**`/`utils/{shared,server}/**` "always" override
    // spuriously matches this directory's own `test/unit/server/**` and
    // `test/unit/utils/{shared,server}/**` subtrees (same names, wrong
    // level). None of test/unit/** is native-ESM-loaded (Mocha's Babel-ESM
    // loader handles it all), so it always gets the "never" convention.
    'import/extensions': ['error', 'never', { ignorePackages: true }],
  },
};
