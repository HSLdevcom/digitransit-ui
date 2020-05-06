/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import isDuplicate from '.';

describe('Testing @digitransit-util/digitransit-util-is-duplicate module', () => {
  it('Checking that duplicate items returns true', () => {
    const param1 = {
      properties: {
        gtfsId: 'HSL:0001',
        gid: 'string',
        name: 'TestName',
        label: 'TestLabel',
        address: 'TestAddress',
        geometry: {
          coordinates: [33, 33],
        },
      },
    };

    const param2 = {
      properties: {
        gtfsId: 'HSL:0001',
        gid: 'string',
        name: 'TestName',
        label: 'TestLabel',
        address: 'TestAddress',
        geometry: {
          coordinates: [33, 33],
        },
      },
    };
    const retValue = isDuplicate(param1, param2);
    expect(retValue).to.be.equal(true);
  });

  it('Checking that non-duplicate items returns false', () => {
    const param1 = {
      properties: {
        gtfsId: 'HSL:0001',
        gid: 'string',
        name: 'NameTest',
        label: 'TestLabel',
        address: 'TestAddress',
        geometry: {
          coordinates: [33, 33],
        },
      },
    };

    const param2 = {
      properties: {
        gtfsId: 'HSL:0001',
        gid: 'string',
        name: 'TestName',
        label: 'TestLabel',
        address: 'TestAddress',
        geometry: {
          coordinates: [33, 33],
        },
      },
    };
    const retValue = isDuplicate(param1, param2);
    expect(retValue).to.be.equal(true);
  });
});
