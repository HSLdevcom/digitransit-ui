import { getJson } from '../../../../utils/shared/xhrPromise';

describe('xhrPromise', () => {
  describe('getJson', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    });

    it('resolves to the parsed response body', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ json: async () => ({ ok: true }) }),
      );

      await expect(getJson('https://example.com/data')).resolves.toEqual({
        ok: true,
      });
      expect(vi.getTimerCount()).toBe(0);
    });

    it('aborts a request that does not respond within 10 seconds', async () => {
      // Never settles on its own, only when aborted - like a hanging server.
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (url, { signal }) =>
            new Promise((resolve, reject) => {
              signal.addEventListener('abort', () =>
                reject(new Error('aborted')),
              );
            }),
        ),
      );

      const result = getJson('https://example.com/data');
      vi.advanceTimersByTime(10000);

      await expect(result).rejects.toThrow('aborted');
    });
  });
});
