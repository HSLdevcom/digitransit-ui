import { describe, it, expect } from 'vitest';
import filterMatchingToInput from './index.js';

describe('Testing @digitransit-util/digitransit-util-filter-matching-to-input module', () => {
  it('Checking that true is true', () => {
    // const retValue = filterMatchingToInput(param1, param2);
    expect(true).toBe(true);
  });

  it('should return list if no input is given', () => {
    const list = ['val1', 'val2'];
    const retValue = filterMatchingToInput(list, '', []);
    expect(list).toBe(retValue);
  });

  it('should return list if input is not string', () => {
    const list = ['val1', 'val2'];
    const retValue = filterMatchingToInput(list, false, []);
    expect(list).toBe(retValue);
  });

  it('should return filtered list', () => {
    const lon = 24.9414841;
    const lat = 60.1710688;
    const testObj = {
      properties: {
        confidence: 0.95,
        label: 'testaddress4',
        layer: 'address',
        name: 'testaddress4',
      },
      geometry: { coordinates: [lon, lat] },
    };
    const testObj2 = {
      properties: {
        label: 'steissi',
        layer: 'favouriteStation',
        address: 'Rautatieasema, Helsinki',
        gtfsId: 'HSL:1000003',
      },
      geometry: { coordinates: [lon, lat] },
    };
    const list = [testObj, testObj2];
    const retValue = filterMatchingToInput(list, 'steissi', [
      'properties.label',
    ]);
    expect(testObj2).toBe(retValue[0]);
  });
});
