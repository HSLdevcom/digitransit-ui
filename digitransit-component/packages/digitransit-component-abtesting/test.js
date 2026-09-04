import { expect } from 'chai';
import { describe, it } from 'mocha';
import AbtestingModule from './lib/index.cjs';

describe('Testing @digitransit-component/digitransit-component-abtesting module', () => {
  it('loads without error', () => {
    expect(AbtestingModule).to.be.an('object');
  });
});
