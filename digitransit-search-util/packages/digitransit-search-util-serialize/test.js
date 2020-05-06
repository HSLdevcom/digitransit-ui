/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import serialize from '.';

describe('Testing @digitransit-search-util/digitransit-search-util-serialize module', () => {
  it('Checking that null returns empty', () => {
    const retValue = serialize(null, 'hello');
    expect('').to.be.equal(retValue);
  });
});
