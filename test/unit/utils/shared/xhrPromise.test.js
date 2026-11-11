import { getJson, HttpError } from '../../../../utils/shared/xhrPromise';

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
        vi.fn().mockResolvedValue({ ok: true, json: async () => ({ a: 1 }) }),
      );

      await expect(getJson('https://example.com/data')).resolves.toEqual({
        a: 1,
      });
      expect(vi.getTimerCount()).toBe(0);
    });

    it('rejects with an HttpError on an error status', async () => {
      const json = vi.fn(async () => ({ error: 'bad request' }));
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json,
        }),
      );

      const error = await getJson('https://example.com/data').catch(e => e);

      expect(error).toBeInstanceOf(HttpError);
      expect(error.status).toBe(400);
      expect(json).not.toHaveBeenCalled();
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
