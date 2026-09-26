import { describe, it, expect } from 'vitest';
import isTruthyAndEqual from '../src/isTruthyAndEqual.js';

describe('isTruthyAndEqual', () => {
  it('Checking that true is true', () => {
    const retValue = isTruthyAndEqual(true, true);
    expect(true).toBe(retValue);
  });
  it('Checking that values dont match ', () => {
    const retValue = isTruthyAndEqual(2, '2');
    expect(false).toBe(retValue);
  });
  it('Checking that values match ', () => {
    const retValue = isTruthyAndEqual('2', '2');
    expect(true).toBe(retValue);
  });
  it('Checking that null values returns null', () => {
    const retValue = isTruthyAndEqual(null, null);
    expect(null).toBe(retValue);
  });
  it('Checking object equality ', () => {
    const obj = { name: 'hey' };
    const retValue = isTruthyAndEqual(obj, obj);
    expect(true).toBe(retValue);
  });
});
