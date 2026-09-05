import { describe, it, expect } from 'vitest';
import distance from './index.js';

describe('Testing @digitransit-util/digitransit-util-distance module', () => {
  it('Checking that distance is calculated', () => {
    const latlon1 = {
      lat: 3,
      lon: 2,
    };
    const latlon2 = {
      lat: 4,
      lon: 1,
    };

    const retValue = distance(latlon1, latlon2);
    expect(157105.77709637067).toBe(retValue);
  });
});
