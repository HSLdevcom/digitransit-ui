import { describe, it, expect } from 'vitest';
import getGeocodingResults from './index.js';

describe('Testing @digitransit-search-util/digitransit-search-util-get-geocoding-results module', () => {
  it('resolves to an empty array for an empty search string, without making a request', () => {
    return getGeocodingResults('').then(results => {
      expect(results).toEqual([]);
    });
  });

  it('resolves to an empty array for a whitespace-only search string', () => {
    return getGeocodingResults('   ').then(results => {
      expect(results).toEqual([]);
    });
  });

  it('resolves to an empty array when the search string fails minimalRegexp', () => {
    return getGeocodingResults(
      'a',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      /^\d+$/,
    ).then(results => {
      expect(results).toEqual([]);
    });
  });
});
