/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import uniqByLabel from '.';

const feature1 = {
  properties: {
    id: 1,
    layer: 'route-BUS',
    labelId: 'id',
    address: 'address',
    shortName: 'sht',
    mode: 'moude',
    longName: 'short',
    agency: { name: 'test' },
    label: 'test',
  },
};

const feature2 = {
  properties: {
    id: 2,
    layer: 'route-BUS',
    labelId: 'id2',
    address: 'address4',
    shortName: 'shta',
    mode: 'moudew',
    longName: 'shorta',
    agency: { name: 'test' },
    label: 'teset',
  },
};

const feature3 = {
  properties: {
    id: 1,
    layer: 'route-BUS',
    labelId: 'id',
    address: 'address',
    shortName: 'sht',
    mode: 'moude',
    longName: 'short',
    agency: { name: 'test' },
    label: 'test',
  },
};
describe('Testing @digitransit-search-util/digitransit-search-util-uniq-by-label module', () => {
  it('Checking that returns unique results by label', () => {
    const features = [feature1, feature2, feature3];
    const retValue = uniqByLabel(features);
    expect(retValue.length).to.be.equal(2);
  });

  it('Checking that returns only one result', () => {
    const features = [feature1, feature3];
    const retValue = uniqByLabel(features);
    expect(retValue.length).to.be.equal(1);
  });
});
