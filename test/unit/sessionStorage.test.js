import {
  getSessionStorage,
  getSessionMessageIds,
  setSessionMessageIds,
} from '../../app/store/sessionStorage';

describe('sessionStorage', () => {
  describe('getSessionStorage', () => {
    it('should invoke the given errorHandler and sessionStorage throws', () => {
      const handler = vi.fn();
      const stub = vi
        .spyOn(window, 'sessionStorage', 'get')
        .mockImplementation(() => {
          throw new DOMException();
        });
      getSessionStorage(handler);
      expect(handler).toHaveBeenCalled();
      stub.mockRestore();
    });

    it('should return null if thrown exception was a SecurityError and it was handled by default', () => {
      const stub = vi
        .spyOn(window, 'sessionStorage', 'get')
        .mockImplementation(() => {
          throw new DOMException('Foo', 'SecurityError');
        });
      const result = getSessionStorage();
      expect(result).toBe(null);
      stub.mockRestore();
    });

    it('should return window.sessionStorage', () => {
      const result = getSessionStorage(true);
      expect(result).toBe(window.sessionStorage);
    });
  });

  describe('getSessionMessageIds', () => {
    it('result should be empty array', () => {
      const result = getSessionMessageIds();
      expect(result).toHaveLength(0);
    });
    it('result should be "1"', () => {
      window.sessionStorage.setItem('messages', JSON.stringify(1));
      const result = getSessionMessageIds();
      expect(result).toBe(JSON.parse('1'));
    });
  });

  describe('setSessionMessageIds', () => {
    it('result should be ["1"]', () => {
      setSessionMessageIds(['1']);
      const result = window.sessionStorage.getItem('messages');
      expect(result).toBe('["1"]');
    });
  });
});
