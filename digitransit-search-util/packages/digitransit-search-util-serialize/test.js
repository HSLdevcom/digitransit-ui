import { describe, it, expect } from 'vitest';
import serialize from './index.js';

describe('Testing @digitransit-search-util/digitransit-search-util-serialize module', () => {
  it('Checking that null returns empty', () => {
    const retValue = serialize(null, 'hello');
    expect('').toBe(retValue);
  });
});
