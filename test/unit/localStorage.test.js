import {
  getLocalStorage,
  getCustomizedSettings,
  setCustomizedSettings,
  getReadMessageIds,
  setReadMessageIds,
} from '../../app/store/localStorage';
import defaultConfig from '../../app/configurations/config.default';

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
      const stub = vi
        .spyOn(window, 'localStorage', 'get')
        .mockImplementation(() => {
          throw new DOMException();
        });
      getLocalStorage(handler);
      expect(handler).toHaveBeenCalled();
      stub.mockRestore();
    });

    it('should return null if thrown exception was a SecurityError and it was handled by default', () => {
      const stub = vi
        .spyOn(window, 'localStorage', 'get')
        .mockImplementation(() => {
          throw new DOMException('Foo', 'SecurityError');
        });
      const result = getLocalStorage();
      expect(result).toBe(null);
      stub.mockRestore();
    });

    it('should return window.localStorage', () => {
      const result = getLocalStorage();
      expect(result).toBe(window.localStorage);
    });
  });
  describe('getReadMessageIds', () => {
    it('result should be empty array', () => {
      const result = getReadMessageIds();
      expect(result).toHaveLength(0);
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
