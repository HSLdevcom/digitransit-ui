/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import distance from '.';

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
    expect(157105.77709637067).to.be.equal(retValue);
  });
});
