import { isDevRunEnv } from '../../../../utils/server/envUtils';

describe('envUtils', () => {
  const originalRunEnv = process.env.RUN_ENV;

  afterEach(() => {
    process.env.RUN_ENV = originalRunEnv;
  });

  describe('isDevRunEnv', () => {
    it('returns true when RUN_ENV is "development"', () => {
      process.env.RUN_ENV = 'development';
      expect(isDevRunEnv()).toBe(true);
    });

    it('returns false when RUN_ENV is "production"', () => {
      process.env.RUN_ENV = 'production';
      expect(isDevRunEnv()).toBe(false);
    });

    it('returns false when RUN_ENV is unset', () => {
      delete process.env.RUN_ENV;
      expect(isDevRunEnv()).toBe(false);
    });
  });
});
