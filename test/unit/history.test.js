import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createHistory, createMemoryHistory } from 'history';

import { getCreateHistoryFunction } from '../../app/history';
import createLocalStorageHistory from '../../app/localStorageHistory';

describe('history', () => {
  describe('getCreateHistoryFunction', () => {
    it('should use createMemoryHistory by default', () => {
      const result = getCreateHistoryFunction();
      expect(result).to.equal(createMemoryHistory);
    });

    it('should use createHistory if in browser', () => {
      const path = '/';
      const result = getCreateHistoryFunction(path, true);
      expect(result).to.equal(createHistory);
    });

    it('should use localStorageHistory if in iOSApp and path is root', () => {
      const path = '/';
      const result = getCreateHistoryFunction(path, true, true);
      expect(result).to.equal(createLocalStorageHistory);
    });

    it('should use createHistory if in iOSApp and path is not root', () => {
      const path = '/reitti/foo/bar';
      const result = getCreateHistoryFunction(path, true, true);
      expect(result).to.equal(createHistory);
    });
  });
});
