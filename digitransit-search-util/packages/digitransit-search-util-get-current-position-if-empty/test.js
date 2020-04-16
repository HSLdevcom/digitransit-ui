/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import getCurrentPositionIfEmpty from '.';

describe('Testing @digitransit-search-util/digitransit-search-util-get-current-position-if-empty module', () => {
  it('Should return current position if input is empty', () => {
    const position = {
      address: 'TestAddress',
      lat: 3,
      lon: 2,
    };

    const obj = Promise.resolve([
      {
        type: 'CurrentLocation',
        address: 'TestAdress',
        lat: 3,
        lon: 2,
        properties: {
          labelId: 'use-own-position',
          layer: 'currentPosition',
          address: 'TestAdress',
          lat: 3,
          lon: 2,
        },
        geometry: {
          type: 'Point',
          coordinates: [3, 2],
        },
      },
    ]);
    const retValue = getCurrentPositionIfEmpty('', position);
    expect(retValue.address).to.be.equal(obj.address);
  });

  it('Should return empty promise if input is given', () => {
    const position = {
      address: 'TestAddress',
      lat: 3,
      lon: 2,
    };

    const obj = Promise.resolve([
      {
        type: 'CurrentLocation',
        address: 'TestAdress',
        lat: 3,
        lon: 2,
        properties: {
          labelId: 'use-own-position',
          layer: 'currentPosition',
          address: 'TestAdress',
          lat: 3,
          lon: 2,
        },
        geometry: {
          type: 'Point',
          coordinates: [3, 2],
        },
      },
    ]);
    const retValue = getCurrentPositionIfEmpty('test', position);
    expect(retValue).not.to.be.equal(obj);
  });
});
