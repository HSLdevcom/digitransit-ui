import { mockRouter, mockMatch } from './mock-router';
import config from '../../../server/configs/config.default';

/**
 * The mockContext can be used as a starting point for building a useful
 * context for testing different types of React components and fulfilling
 * their propType requirements.
 */
export const mockContext = {
  config: { ...config, language: config.defaultLanguage || 'en' },
  match: mockMatch,
  router: mockRouter,
};

/**
 * Builds a test config by shallow-merging overrides onto the real default
 * config (mockContext.config), instead of hand-building a config object
 * from scratch per test file.
 */
export const createTestConfig = (overrides = {}) => ({
  ...mockContext.config,
  ...overrides,
});
