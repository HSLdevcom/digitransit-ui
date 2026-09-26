import { describe, it, expect } from 'vitest';
import { sortSearchResults } from '../src/searchHelpers.js';

describe('searchHelpers', () => {
  it('Checking that sortSearchresults verifies array', () => {
    const retValue = sortSearchResults(null, null);
    expect(retValue).toBe(null);
  });
});
