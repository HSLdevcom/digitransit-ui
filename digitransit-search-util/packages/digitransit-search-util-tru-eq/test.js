import { describe, it, expect } from 'vitest';
import truEq from './index.js';

describe('Testing @digitransit-util/digitransit-util-tru-eq module', () => {
  it('Checking that true is true', () => {
    const retValue = truEq(true, true);
    expect(true).toBe(retValue);
  });
  it('Checking that values dont match ', () => {
    const retValue = truEq(2, '2');
    expect(false).toBe(retValue);
  });
  it('Checking that values match ', () => {
    const retValue = truEq('2', '2');
    expect(true).toBe(retValue);
  });
  it('Checking that null values returns null', () => {
    const retValue = truEq(null, null);
    expect(null).toBe(retValue);
  });
  it('Checking object equality ', () => {
    const obj = { name: 'hey' };
    const retValue = truEq(obj, obj);
    expect(true).toBe(retValue);
  });
});
