process.env.JEST_PLAYWRIGHT_CONFIG = `./test/e2e/jest-playwright-${
  (process.env.MOBILE === 'true' && 'mobile') || 'desktop'
}.config.js`;

module.exports = {
  verbose: true,
  rootDir: '../..',
  roots: ['./test/e2e'],
  testMatch: ['**/?(*.)+(test).js'],
  testPathIgnorePatterns: ['/node_modules/', 'app', 'build', '_static'],
  testTimeout: 200000,
  preset: 'jest-playwright-preset',
  setupFilesAfterEnv: ['./test/e2e/jest.image.js'],
};
