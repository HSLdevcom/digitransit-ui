/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import truEq from '.';

describe('Testing @digitransit-util/digitransit-util-tru-eq module', () => {
  it('Checking that true is true', () => {
    const retValue = truEq(true, true);
    expect(true).to.be.equal(retValue);
  });
  it('Checking that values dont match ', () => {
    const retValue = truEq(2, '2');
    expect(false).to.be.equal(retValue);
  });
  it('Checking that values match ', () => {
    const retValue = truEq('2', '2');
    expect(true).to.be.equal(retValue);
  });
  it('Checking that null values returns null', () => {
    const retValue = truEq(null, null);
    expect(null).to.be.equal(retValue);
  });
  it('Checking object equality ', () => {
    const obj = { name: 'hey' };
    const retValue = truEq(obj, obj);
    expect(true).to.be.equal(retValue);
  });
});
