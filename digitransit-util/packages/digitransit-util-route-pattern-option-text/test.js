/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';
import cloneDeep from 'lodash/cloneDeep';
import routePatternOptionText from '.';

const languages = ['fi', 'en', 'sv'];

const ad = [];
ad.push(JSON.parse('{ "day": ["20200221"] }'));
ad.push(JSON.parse('{ "day": ["20200222"] }'));
ad.push(JSON.parse('{ "day": ["20200228"] }'));
ad.push(JSON.parse('{ "day": ["20200229"] }'));
ad.push(JSON.parse('{ "day": ["20200306"] }'));
ad.push(JSON.parse('{ "day": ["20200307"] }'));
ad.push(JSON.parse('{ "day": ["20200313"] }'));
ad.push(JSON.parse('{ "day": ["20200314"] }'));

const first = '20200201';
const last = '20200401';

const fd1 = [];
const fd2 = [];
const fd3 = [];
ad.forEach(function(d) {
  fd1.push(moment(d.day[0], 'YYYYMMDD').format('D.'));
  fd2.push(moment(d.day[0], 'YYYYMMDD').format('D.M.'));
  fd3.push(moment(d.day[0], 'YYYYMMDD').format('YYYYMMDD'));
});

const tests = [
  {
    title: "Togglable: 'ma-su'",
    togglable: true,
    expected: [
      'Helsinki ➔ Kirkkonummi',
      'Helsinki ➔ Kirkkonummi',
      'Helsinki ➔ Kirkkonummi',
    ],
    tripsForDate: [],
    dayString: 'ma-su',
  },
  {
    title: "Togglable: 'pe-la'",
    togglable: true,
    expected: [
      'Helsinki ➔ Kirkkonummi (pe-la)',
      'Helsinki ➔ Kirkkonummi (Fri-Sat)',
      'Helsinki ➔ Kirkkonummi (fre-lör)',
    ],
    tripsForDate: [],
    dayString: 'pe-la',
  },
  {
    title: `Opt #1: only ${fd2[4]}`,
    togglable: false,
    expected: [
      `Helsinki ➔ Kirkkonummi (vain ${fd2[4]})`,
      `Helsinki ➔ Kirkkonummi (only ${fd2[4]})`,
      `Helsinki ➔ Kirkkonummi (bara ${fd2[4]})`,
    ],
    tripsForDate: [],
    activeDates: [fd3[4]],
    rangeFollowingDays: [[fd3[4], 0]],
    dayString: 'pe-pe',
    allowedDiff: 1,
    fromDate: fd3[4],
    untilDate: fd3[4],
  },
  {
    title: `Opt #1: range ${fd1[4]}-${fd2[5]}`,
    togglable: false,
    expected: [
      `Helsinki ➔ Kirkkonummi (${fd1[4]}-${fd2[5]})`,
      `Helsinki ➔ Kirkkonummi (${fd1[4]}-${fd2[5]})`,
      `Helsinki ➔ Kirkkonummi (${fd1[4]}-${fd2[5]})`,
    ],
    tripsForDate: [],
    activeDates: [fd3[4], fd3[5]],
    rangeFollowingDays: [[fd3[4], fd3[5]]],
    dayString: 'pe-la',
    allowedDiff: 1,
    fromDate: fd3[4],
    untilDate: fd3[5],
  },
  {
    title: `Opt #2: ranges ${fd1[2]}-${fd2[3]}, ${fd1[6]}-${fd2[7]}`,
    togglable: false,
    expected: [
      `Helsinki ➔ Kirkkonummi (${fd1[2]}-${fd2[3]}, ${fd1[6]}-${fd2[7]})`,
      `Helsinki ➔ Kirkkonummi (${fd1[2]}-${fd2[3]}, ${fd1[6]}-${fd2[7]})`,
      `Helsinki ➔ Kirkkonummi (${fd1[2]}-${fd2[3]}, ${fd1[6]}-${fd2[7]})`,
    ],
    tripsForDate: [],
    activeDates: [fd3[2], fd3[3], fd3[6], fd3[7]],
    rangeFollowingDays: [[fd3[2], fd3[3]], [fd3[6], fd3[7]]],
    dayString: '-',
    allowedDiff: 1,
    fromDate: fd3[2],
    untilDate: fd3[7],
  },
  {
    title: 'Opt #3a: empty',
    togglable: false,
    expected: [
      'Helsinki ➔ Kirkkonummi',
      'Helsinki ➔ Kirkkonummi',
      'Helsinki ➔ Kirkkonummi',
    ],
    activeDates: [first, fd3[0], fd3[1], last],
    rangeFollowingDays: [[first, last]],
    dayString: 'ma-su',
    fromDate: '-',
    untilDate: '-',
  },
  {
    title: "Opt #3b: 'Fri-Sat'",
    togglable: false,
    expected: [
      'Helsinki ➔ Kirkkonummi (pe-la)',
      'Helsinki ➔ Kirkkonummi (Fri-Sat)',
      'Helsinki ➔ Kirkkonummi (fre-lör)',
    ],
    activeDates: [first, fd3[0], fd3[1], last],
    rangeFollowingDays: [[first, last]],
    dayString: 'pe-la',
    fromDate: '-',
    untilDate: '-',
  },
  {
    title: `Opt #4a: until ${fd2[5]}`,
    togglable: false,
    expected: [
      `Helsinki ➔ Kirkkonummi (${fd2[5]} saakka)`,
      `Helsinki ➔ Kirkkonummi (until ${fd2[5]})`,
      `Helsinki ➔ Kirkkonummi (till ${fd2[5]})`,
    ],
    activeDates: [
      fd3[0],
      fd3[1],
      fd3[2],
      fd3[3],
      fd3[4],
      fd3[5],
      fd3[6],
      fd3[7],
      fd3[8],
    ],
    rangeFollowingDays: [[fd3[0], fd3[5]]],
    dayString: 'ma-su',
    fromDate: '-',
    untilDate: fd3[5],
  },
  {
    title: `Opt #4b: 'Fri-Sat' until ${fd2[5]}`,
    togglable: false,
    expected: [
      `Helsinki ➔ Kirkkonummi (pe-la ${fd2[5]} saakka)`,
      `Helsinki ➔ Kirkkonummi (Fri-Sat until ${fd2[5]})`,
      `Helsinki ➔ Kirkkonummi (fre-lör till ${fd2[5]})`,
    ],
    activeDates: [
      fd3[0],
      fd3[1],
      fd3[2],
      fd3[3],
      fd3[4],
      fd3[5],
      fd3[6],
      fd3[7],
      fd3[8],
    ],
    rangeFollowingDays: [[fd3[0], fd3[5]]],
    dayString: 'pe-la',
    fromDate: '-',
    untilDate: fd3[5],
  },
  {
    title: `Opt #5a: from ${fd2[2]}`,
    togglable: false,
    expected: [
      `Helsinki ➔ Kirkkonummi (${fd2[2]} lähtien)`,
      `Helsinki ➔ Kirkkonummi (from ${fd2[2]})`,
      `Helsinki ➔ Kirkkonummi (från ${fd2[2]})`,
    ],
    activeDates: [fd3[2], fd3[3], fd3[4], fd3[5], fd3[6], fd3[7], fd3[8]],
    rangeFollowingDays: [[fd3[2], fd3[8]]],
    dayString: 'ma-su',
    fromDate: fd3[2],
    untilDate: '-',
  },
  {
    title: `Opt #5b: 'Fri-Sat' from ${fd2[2]}`,
    togglable: false,
    expected: [
      `Helsinki ➔ Kirkkonummi (pe-la ${fd2[2]} lähtien)`,
      `Helsinki ➔ Kirkkonummi (Fri-Sat from ${fd2[2]})`,
      `Helsinki ➔ Kirkkonummi (fre-lör från ${fd2[2]})`,
    ],
    activeDates: [fd3[2], fd3[3], fd3[4], fd3[5], fd3[6], fd3[7], fd3[8]],
    rangeFollowingDays: [[fd3[2], fd3[8]]],
    dayString: 'pe-la',
    fromDate: fd3[2],
    untilDate: '-',
  },
];

const defPattern = {
  code: 'HSL:3002U:0:02',
  headsign: 'Kirkkonummi',
  stops: [{ name: 'Helsinki' }, { name: 'Kirkkonummi' }],
  tripsForDate: [],
  lastRangeDate: moment('20200330').format('YYYYMMDD'),
  currentDate: moment('20200220').format('YYYYMMDD'),
};

describe('Testing @digitransit-util/digitransit-util-route-pattern-option-text module', () => {
  languages.forEach(function(language, index) {
    describe(`Checking language '${language}'`, () => {
      tests.forEach(function(test) {
        const pattern = cloneDeep(defPattern);
        pattern.activeDates = test.activeDates;
        pattern.rangeFollowingDays = test.rangeFollowingDays;
        pattern.dayString = test.dayString;
        pattern.fromDate = test.fromDate;
        pattern.untilDate = test.untilDate;
        it(test.title, () => {
          const retValue = routePatternOptionText(
            language,
            pattern,
            test.togglable,
          );
          expect(retValue).to.be.equal(test.expected[index]);
        });
      });
    });
  });
});
