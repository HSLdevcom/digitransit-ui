/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { sortSearchResults } from './index';

describe('Testing @digitransit-search-util/digitransit-search-util-helpers module', () => {
  it('Checking that sortSearchresults verifies array', () => {
    const retValue = sortSearchResults(null, null);
    expect(retValue).to.be.equal(null);
  });
});
