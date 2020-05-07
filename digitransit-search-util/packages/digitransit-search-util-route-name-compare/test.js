/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import routeNameCompare from '.';

const a = {
  shortName: 'hki',
  longName: 'Helsinki',
  agency: {
    name: 'hsl',
  },
};
const b = {
  shortName: 'hki',
  longName: 'Helsinki',
  agency: {
    name: 'hsl',
  },
};

const c = {
  shortName: 'VNT',
  longName: 'Vantaa',
  agency: {
    name: 'hsl',
  },
};
describe('Testing @digitransit-search-util/digitransit-search-util-route-name-compare module', () => {
  it('Checking that same routes returns 0 ', () => {
    const retValue = routeNameCompare(a, b);
    expect(0).to.be.equal(retValue);
  });

  it('Checking that different routes returns -1 ', () => {
    const retValue = routeNameCompare(a, c);
    expect(-1).to.be.equal(retValue);
  });
});
