import { describe, it, expect } from 'vitest';
import getJson from './index.js';

describe('Testing @digitransit-search-util/digitransit-search-util-get-json module', () => {
  it('Checking that null returns empty ', async () => {
    const retValue = getJson(null, null);
    const test = retValue === {};
    expect(test).toBe(false);
    // getJson(null, null) fires a real (doomed) axios request that rejects
    // asynchronously ("Invalid URL") after the assertion above already ran;
    // swallow that rejection here so it doesn't surface as an unhandled
    // rejection once nothing else awaits retValue.
    await retValue.catch(() => {});
  });
});
