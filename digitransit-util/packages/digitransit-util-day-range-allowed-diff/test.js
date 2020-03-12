/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import dayRangeAllowedDiff from '.';

const testsForMonday = [
  { allowedDiff: 7, dayNoArray: ['1', '1', '1', '1'] },
  { allowedDiff: 1, dayNoArray: ['2', '2', '2', '2'] },
  { allowedDiff: 2, dayNoArray: ['3', '3', '3', '3'] },
  { allowedDiff: 3, dayNoArray: ['4', '4', '4', '4'] },
  { allowedDiff: 4, dayNoArray: ['5', '5', '5', '5'] },
  { allowedDiff: 5, dayNoArray: ['6', '6', '6', '6'] },
  { allowedDiff: 6, dayNoArray: ['7', '7', '7', '7'] },
  { allowedDiff: 4, dayNoArray: ['5', '6', '5', '6'] },
  { allowedDiff: 5, dayNoArray: ['6', '7', '6', '7'] },
  { allowedDiff: 4, dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    allowedDiff: 1,
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

const testsforTuesday = [
  { allowedDiff: 6, dayNoArray: ['1', '1', '1', '1'] },
  { allowedDiff: 7, dayNoArray: ['2', '2', '2', '2'] },
  { allowedDiff: 1, dayNoArray: ['3', '3', '3', '3'] },
  { allowedDiff: 2, dayNoArray: ['4', '4', '4', '4'] },
  { allowedDiff: 3, dayNoArray: ['5', '5', '5', '5'] },
  { allowedDiff: 4, dayNoArray: ['6', '6', '6', '6'] },
  { allowedDiff: 5, dayNoArray: ['7', '7', '7', '7'] },
  { allowedDiff: 3, dayNoArray: ['5', '6', '5', '6'] },
  { allowedDiff: 4, dayNoArray: ['6', '7', '6', '7'] },
  { allowedDiff: 3, dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    allowedDiff: 1,
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

const testsForWednesday = [
  { allowedDiff: 5, dayNoArray: ['1', '1', '1', '1'] },
  { allowedDiff: 6, dayNoArray: ['2', '2', '2', '2'] },
  { allowedDiff: 7, dayNoArray: ['3', '3', '3', '3'] },
  { allowedDiff: 1, dayNoArray: ['4', '4', '4', '4'] },
  { allowedDiff: 2, dayNoArray: ['5', '5', '5', '5'] },
  { allowedDiff: 3, dayNoArray: ['6', '6', '6', '6'] },
  { allowedDiff: 4, dayNoArray: ['7', '7', '7', '7'] },
  { allowedDiff: 2, dayNoArray: ['5', '6', '5', '6'] },
  { allowedDiff: 3, dayNoArray: ['6', '7', '6', '7'] },
  { allowedDiff: 2, dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    allowedDiff: 1,
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

const testsForThursday = [
  { allowedDiff: 4, dayNoArray: ['1', '1', '1', '1'] },
  { allowedDiff: 5, dayNoArray: ['2', '2', '2', '2'] },
  { allowedDiff: 6, dayNoArray: ['3', '3', '3', '3'] },
  { allowedDiff: 7, dayNoArray: ['4', '4', '4', '4'] },
  { allowedDiff: 1, dayNoArray: ['5', '5', '5', '5'] },
  { allowedDiff: 2, dayNoArray: ['6', '6', '6', '6'] },
  { allowedDiff: 3, dayNoArray: ['7', '7', '7', '7'] },
  { allowedDiff: 1, dayNoArray: ['5', '6', '5', '6'] },
  { allowedDiff: 2, dayNoArray: ['6', '7', '6', '7'] },
  { allowedDiff: 1, dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    allowedDiff: 1,
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

const testsForFriday = [
  { allowedDiff: 3, dayNoArray: ['1', '1', '1', '1'] },
  { allowedDiff: 4, dayNoArray: ['2', '2', '2', '2'] },
  { allowedDiff: 5, dayNoArray: ['3', '3', '3', '3'] },
  { allowedDiff: 6, dayNoArray: ['4', '4', '4', '4'] },
  { allowedDiff: 7, dayNoArray: ['5', '5', '5', '5'] },
  { allowedDiff: 1, dayNoArray: ['6', '6', '6', '6'] },
  { allowedDiff: 2, dayNoArray: ['7', '7', '7', '7'] },
  { allowedDiff: 7, dayNoArray: ['5', '6', '5', '6'] },
  { allowedDiff: 1, dayNoArray: ['6', '7', '6', '7'] },
  { allowedDiff: 7, dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    allowedDiff: 3,
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    allowedDiff: 2,
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    allowedDiff: 1,
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

const testForSaturday = [
  { allowedDiff: 2, dayNoArray: ['1', '1', '1', '1'] },
  { allowedDiff: 3, dayNoArray: ['2', '2', '2', '2'] },
  { allowedDiff: 4, dayNoArray: ['3', '3', '3', '3'] },
  { allowedDiff: 5, dayNoArray: ['4', '4', '4', '4'] },
  { allowedDiff: 6, dayNoArray: ['5', '5', '5', '5'] },
  { allowedDiff: 7, dayNoArray: ['6', '6', '6', '6'] },
  { allowedDiff: 1, dayNoArray: ['7', '7', '7', '7'] },
  { allowedDiff: 6, dayNoArray: ['5', '6', '5', '6'] },
  { allowedDiff: 7, dayNoArray: ['6', '7', '6', '7'] },
  { allowedDiff: 1, dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    allowedDiff: 2,
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    allowedDiff: 2,
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    allowedDiff: 1,
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

const testsForSunday = [
  { allowedDiff: 1, dayNoArray: ['1', '1', '1', '1'] },
  { allowedDiff: 2, dayNoArray: ['2', '2', '2', '2'] },
  { allowedDiff: 3, dayNoArray: ['3', '3', '3', '3'] },
  { allowedDiff: 4, dayNoArray: ['4', '4', '4', '4'] },
  { allowedDiff: 5, dayNoArray: ['5', '5', '5', '5'] },
  { allowedDiff: 6, dayNoArray: ['6', '6', '6', '6'] },
  { allowedDiff: 7, dayNoArray: ['7', '7', '7', '7'] },
  { allowedDiff: 5, dayNoArray: ['5', '6', '5', '6'] },
  { allowedDiff: 6, dayNoArray: ['6', '7', '6', '7'] },
  { allowedDiff: 5, dayNoArray: ['5', '6', '7', '5', '6', '7'] },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '1', '2', '3', '4', '5', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '6', '1', '2', '3', '4', '5', '6', '1', '2'],
  },
  {
    allowedDiff: 1,
    dayNoArray: ['3', '4', '5', '7', '1', '2', '3', '4', '5', '7', '1', '2'],
  },
  {
    allowedDiff: 1,
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

describe('Testing @digitransit-util/digitransit-util-day-range-allowed-diff', () => {
  describe('When current day number is 1 (Monday)', () => {
    testsForMonday.forEach(function(test) {
      it(`should return "${
        test.allowedDiff
      }" when day number\`s string is "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
        const retValue = dayRangeAllowedDiff(test.dayNoArray, 1);
        expect(retValue).to.equal(test.allowedDiff);
      });
    });
  });
  describe('When current day number is 2 (Tuesday)', () => {
    testsforTuesday.forEach(function(test) {
      it(`should return "${
        test.allowedDiff
      }" when day number\`s string is "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
        const retValue = dayRangeAllowedDiff(test.dayNoArray, 2);
        expect(retValue).to.equal(test.allowedDiff);
      });
    });
  });
  describe('When current day number is 3 (Wednesday)', () => {
    testsForWednesday.forEach(function(test) {
      it(`should return "${
        test.allowedDiff
      }" when day number\`s string is "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
        const retValue = dayRangeAllowedDiff(test.dayNoArray, 3);
        expect(retValue).to.equal(test.allowedDiff);
      });
    });
  });
  describe('When current day number is 4 (Thursday)', () => {
    testsForThursday.forEach(function(test) {
      it(`should return "${
        test.allowedDiff
      }" when day number\`s string is "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
        const retValue = dayRangeAllowedDiff(test.dayNoArray, 4);
        expect(retValue).to.equal(test.allowedDiff);
      });
    });
  });
  describe('When current day number is 5 (Friday)', () => {
    testsForFriday.forEach(function(test) {
      it(`should return "${
        test.allowedDiff
      }" when day number\`s string is "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
        const retValue = dayRangeAllowedDiff(test.dayNoArray, 5);
        expect(retValue).to.equal(test.allowedDiff);
      });
    });
  });
  describe('When current day number is 6 (Saturday)', () => {
    testForSaturday.forEach(function(test) {
      it(`should return "${
        test.allowedDiff
      }" when day number\`s string is "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
        const retValue = dayRangeAllowedDiff(test.dayNoArray, 6);
        expect(retValue).to.equal(test.allowedDiff);
      });
    });
  });
  describe('When current day number is 7 (Sunday)', () => {
    testsForSunday.forEach(function(test) {
      it(`should return "${
        test.allowedDiff
      }" when day number\`s string is "${Array.from(new Set(test.dayNoArray.sort())).join('')}"`, () => {
        const retValue = dayRangeAllowedDiff(test.dayNoArray, 7);
        expect(retValue).to.equal(test.allowedDiff);
      });
    });
  });
});
