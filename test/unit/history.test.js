import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createHistory, createMemoryHistory } from 'history';
import sinon from 'sinon';

import createRouter, { getCreateHistoryFunction } from '../../app/history';
import createLocalStorageHistory from '../../app/localStorageHistory';
import { PREFIX_ITINERARY_SUMMARY } from '../../app/util/path';

describe('history', () => {
  describe('getCreateHistoryFunction', () => {
    it('should use createMemoryHistory by default in a non-browser environment', () => {
      const path = '/';
      const result = getCreateHistoryFunction(path, false);
      expect(result).to.equal(createMemoryHistory);
    });

    it('should use createHistory if in browser and sessionStorage exists', () => {
      const path = '/';
      const result = getCreateHistoryFunction(path, true);
      expect(result).to.equal(createHistory);
    });

    it('should use createMemoryHistory if in browser and sessionStorage does not exist', () => {
      const stub = sinon.stub(window, 'sessionStorage').get(() => null);
      const path = '/';
      const result = getCreateHistoryFunction(path, true);
      expect(result).to.equal(createMemoryHistory);
      stub.restore();
    });

    it('should use localStorageHistory if in iOSApp and path is root', () => {
      const path = '/';
      const result = getCreateHistoryFunction(path, true, true);
      expect(result).to.equal(createLocalStorageHistory);
    });

    it('should use createHistory if in iOSApp and path is not root', () => {
      const path = `/${PREFIX_ITINERARY_SUMMARY}/foo/bar`;
      const result = getCreateHistoryFunction(path, true, true);
      expect(result).to.equal(createHistory);
    });
  });

  describe('default export', () => {
    it('should not apply the given path if in browser', () => {
      const config = {
        APP_PATH: 'foobar',
      };
      const path = '/foo/bar';
      const router = createRouter(config, path, true);
      expect(router.getCurrentLocation().pathname).to.equal('/');
    });

    it('should apply the given path if not in browser', () => {
      const config = {
        APP_PATH: 'foobar',
      };
      const path = '/foo/bar';
      const router = createRouter(config, path, false);
      expect(router.getCurrentLocation().pathname).to.equal(path);
    });
  });
});
