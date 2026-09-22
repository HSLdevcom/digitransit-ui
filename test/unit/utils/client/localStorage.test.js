import { describe, it, vi } from 'vitest';

import {
  getLocalStorage,
  getCustomizedSettings,
  setCustomizedSettings,
  getReadMessageIds,
  setReadMessageIds,
} from '../../../../utils/client/localStorage';
import defaultConfig from '../../../../server/configs/config.default';

describe('localStorage', () => {
  describe('getCustomizedSettings', () => {
    it('should return an empty object by default', () => {
      expect(getCustomizedSettings()).toEqual({});
    });
  });

  describe('setCustomizedSettings', () => {
    it('should save all default settings', () => {
      const defaultSettings = { ...defaultConfig.defaultSettings };
      // remove values which are not stored because they do not change
      delete defaultSettings.minTransferTime;
      delete defaultSettings.optimize;
      setCustomizedSettings(defaultSettings);
      expect(getCustomizedSettings()).toEqual(defaultSettings);
    });
  });

  describe('getLocalStorage', () => {
    it('should invoke the given errorHandler if in browser and localStorage throws', () => {
      const handler = vi.fn();
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new DOMException();
      });
      getLocalStorage(handler);
      expect(handler.mock.calls.length > 0).toBe(true);
    });

    it('should return null if thrown exception was a SecurityError and it was handled by default', () => {
      vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new DOMException('Foo', 'SecurityError');
      });
      const result = getLocalStorage();
      expect(result).toBeNull();
    });

    it('should return window.localStorage', () => {
      const result = getLocalStorage();
      expect(result).toBe(window.localStorage);
    });
  });
  describe('getReadMessageIds', () => {
    it('result should be empty array', () => {
      const result = getReadMessageIds();
      // eslint-disable-next-line no-unused-expressions
      expect(Object.keys(result)).toHaveLength(0);
    });
    it('result should be "1"', () => {
      window.localStorage.setItem('readMessages', JSON.stringify(1));
      const result = getReadMessageIds();
      expect(result).toBe(JSON.parse('1'));
    });
  });

  describe('setReadMessageIds', () => {
    it('result should be ["1"]', () => {
      setReadMessageIds(['1']);
      const result = window.localStorage.getItem('readMessages');
      expect(result).toBe('["1"]');
    });
  });
});
