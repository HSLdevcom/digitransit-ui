import { isDevRunEnv } from '../../../../utils/server/envUtils';

describe('envUtils', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('isDevRunEnv', () => {
    it('returns true when RUN_ENV is "development"', () => {
      vi.stubEnv('RUN_ENV', 'development');
      expect(isDevRunEnv()).toBe(true);
    });

    it('returns false when RUN_ENV is "production"', () => {
      vi.stubEnv('RUN_ENV', 'production');
      expect(isDevRunEnv()).toBe(false);
    });

    it('returns false when RUN_ENV is unset', () => {
      vi.stubEnv('RUN_ENV', undefined);
      expect(isDevRunEnv()).toBe(false);
    });
  });
});
