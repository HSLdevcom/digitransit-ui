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
    'import/extensions': 'off',
  },
};
