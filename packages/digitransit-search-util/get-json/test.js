import { describe, it, expect, vi, afterEach } from 'vitest';
import axios from 'axios';
import getJson from './index';

const adapterReturning = (status, data) =>
  vi.fn(async config => {
    const response = { data, status, statusText: '', headers: {}, config };
    if (config.validateStatus(status)) {
      return response;
    }
    const error = new Error(`Request failed with status code ${status}`);
    error.response = response;
    throw error;
  });

describe('Testing @digitransit-search-util/digitransit-search-util-get-json module', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves to the parsed response body', async () => {
    const adapter = adapterReturning(200, { a: 1 });
    vi.spyOn(axios, 'get').mockImplementation((url, config) =>
      axios.request({ ...config, url, adapter }),
    );

    await expect(getJson('https://example.com/data')).resolves.toEqual({
      a: 1,
    });
  });

  it('appends serialized params to the url', async () => {
    const adapter = adapterReturning(200, {});
    vi.spyOn(axios, 'get').mockImplementation((url, config) =>
      axios.request({ ...config, url, adapter }),
    );

    await getJson('https://example.com/data?x=1', { text: 'a b' });

    expect(adapter.mock.calls[0][0].url).toBe(
      'https://example.com/data?x=1&text=a%20b',
    );
  });

  it('rejects on an HTTP error status', async () => {
    const adapter = adapterReturning(500, { error: 'boom' });
    vi.spyOn(axios, 'get').mockImplementation((url, config) =>
      axios.request({ ...config, url, adapter }),
    );

    const error = await getJson('https://example.com/data').catch(e => e);

    expect(error.response.status).toBe(500);
  });

  it('rejects a successful response whose body is not JSON', async () => {
    const adapter = adapterReturning(200, '<html>proxy error</html>');
    vi.spyOn(axios, 'get').mockImplementation((url, config) =>
      axios.request({ ...config, url, adapter }),
    );

    await expect(getJson('https://example.com/data')).rejects.toThrow();
  });
});
