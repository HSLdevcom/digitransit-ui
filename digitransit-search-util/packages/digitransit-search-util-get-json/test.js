/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import getJson from '.';

describe('Testing @digitransit-search-util/digitransit-search-util-get-json module', () => {
  it('Checking that null returns empty ', () => {
    const retValue = getJson(null, null);
    const test = retValue === {};
    expect(test).to.be.equal(false);
  });
});
