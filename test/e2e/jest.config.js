process.env.JEST_PLAYWRIGHT_CONFIG = './test/e2e/jest-playwright.config.js';

module.exports = {
  verbose: true,
  rootDir: '../..',
  roots: ['./test/e2e'],
  testMatch: ['**/?(*.)+(spec|test).[j]s'],
  testPathIgnorePatterns: ['/node_modules/', 'dist', 'src', 'build'],
  testTimeout: 200000,
  preset: 'jest-playwright-preset',
  setupFilesAfterEnv: ['./test/e2e/jest.image.js'],
};
