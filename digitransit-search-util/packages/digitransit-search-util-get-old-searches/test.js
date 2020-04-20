/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import getOldSearches from '.';

const oldSearch1 = {
  properties: {
    name: 'Tester',
    label: 'LabelTest',
    address: 'TestStreet 1',
    shortName: 'tst',
    longName: 'testeri',
    type: 'type',
    layer: 'testlayer',
  },
  timetableClicked: false,
  confidence: 200,
};

const oldSearch2 = {
  properties: {
    name: 'Name',
    label: 'Lable',
    address: 'TestStreet 1',
    shortName: 'tst',
    longName: 'testeri',
    type: 'type',
    layer: 'nestlayer',
  },
  timetableClicked: false,
  confidence: 200,
};

const oldSearch12 = {
  properties: {
    name: 'Nester',
    label: 'DiffLabel',
    address: 'StreetTest 1',
    shortName: 'sts',
    longName: 'difftesteri',
    type: 'type',
    layer: 'jestlayer',
  },
  timetableClicked: false,
  confidence: 200,
};
const searches = [oldSearch1, oldSearch12, oldSearch2];

describe('Testing @digitransit-search-util/digitransit-search-util-get-old-searches module', () => {
  it('Checking that function retuns promise', () => {
    const retValue = getOldSearches(searches, 'Nester', []);
    expect(retValue).not.to.be.equal(null);
  });
});
