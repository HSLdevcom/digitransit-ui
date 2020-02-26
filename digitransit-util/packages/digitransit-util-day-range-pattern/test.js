/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import dayRangePattern from '.';

const tests = [
  { dayPattern: 'ma-ma', dayNoArray: ['1', '1', '1', '1'] },
  { dayPattern: 'ti-ti', dayNoArray: ['2', '2', '2', '2'] },
  { dayPattern: 'ke-ke', dayNoArray: ['3', '3', '3', '3'] },
  { dayPattern: 'to-to', dayNoArray: ['4', '4', '4', '4'] },
  { dayPattern: 'pe-pe', dayNoArray: ['5', '5', '5', '5'] },
  { dayPattern: 'la-la', dayNoArray: ['6', '6', '6', '6'] },
  { dayPattern: 'su-su', dayNoArray: ['7', '7', '7', '7'] },
  { dayPattern: 'pe-la', dayNoArray: ['5', '6', '5', '6'] },
  { dayPattern: 'la-su', dayNoArray: ['6', '7', '6', '7'] },
  { dayPattern: 'pe-su', dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    dayPattern: 'ma-pe',
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    dayPattern: 'ma-la',
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    dayPattern: 'su-pe',
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    dayPattern: 'ma-su',
    dayNoArray: [
      '3',
      '4',
      '5',
      '6',
      '7',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '1',
      '2',
    ],
  },
];

describe('Testing @digitransit-util/digitransit-util-day-range-pattern', () => {
  tests.forEach(function(test) {
    it(`should return pattern "${
      test.dayPattern
    }" converted from day number\`s string "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
      const retValue = dayRangePattern(test.dayNoArray);
      expect(retValue).to.equal(test.dayPattern);
    });
  });
});
