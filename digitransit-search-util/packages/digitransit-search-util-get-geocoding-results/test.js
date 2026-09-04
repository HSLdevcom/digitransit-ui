/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import getGeocodingResults from './index.js';

describe('Testing @digitransit-search-util/digitransit-search-util-get-geocoding-results module', () => {
  it('resolves to an empty array for an empty search string, without making a request', () => {
    return getGeocodingResults('').then(results => {
      expect(results).to.deep.equal([]);
    });
  });

  it('resolves to an empty array for a whitespace-only search string', () => {
    return getGeocodingResults('   ').then(results => {
      expect(results).to.deep.equal([]);
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
      expect(results).to.deep.equal([]);
    });
  });
});
