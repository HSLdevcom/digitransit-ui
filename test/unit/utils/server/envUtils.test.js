import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import { isDevRunEnv } from '../../../../utils/server/envUtils';

describe('envUtils', () => {
  const originalRunEnv = process.env.RUN_ENV;

  afterEach(() => {
    process.env.RUN_ENV = originalRunEnv;
  });

  describe('isDevRunEnv', () => {
    it('returns true when RUN_ENV is "development"', () => {
      process.env.RUN_ENV = 'development';
      expect(isDevRunEnv()).to.equal(true);
    });

    it('returns false when RUN_ENV is "production"', () => {
      process.env.RUN_ENV = 'production';
      expect(isDevRunEnv()).to.equal(false);
    });

    it('returns false when RUN_ENV is unset', () => {
      delete process.env.RUN_ENV;
      expect(isDevRunEnv()).to.equal(false);
    });
  });
});
