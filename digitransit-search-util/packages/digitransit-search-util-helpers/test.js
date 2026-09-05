import { describe, it, expect } from 'vitest';
import { sortSearchResults } from './index.js';

describe('Testing @digitransit-search-util/digitransit-search-util-helpers module', () => {
  it('Checking that sortSearchresults verifies array', () => {
    const retValue = sortSearchResults(null, null);
    expect(retValue).toBe(null);
  });
});
