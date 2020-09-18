/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';
import enrichPatterns from '.';

describe('Testing @digitransit-util/digitransit-util-enrich-patterns module', () => {
  const nextFridaysAndSaturdays = [];
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${moment(moment())
        .day(5)
        .format('YYYYMMDD')}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${moment(moment())
        .day(6)
        .format('YYYYMMDD')}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${moment(moment())
        .day(5 + 7)
        .format('YYYYMMDD')}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${moment(moment())
        .day(6 + 7)
        .format('YYYYMMDD')}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${moment(moment())
        .day(5 + 14)
        .format('YYYYMMDD')}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${moment(moment())
        .day(6 + 14)
        .format('YYYYMMDD')}"] }`,
    ),
  );

  const patterns = [
    {
      code: 'HSL:3002U:0:02',
      headsign: 'Kirkkonummi',
      stops: [{ name: 'Helsinki' }, { name: 'Kirkkonummi' }],
      tripsForDate: [],
      activeDates: nextFridaysAndSaturdays,
    },
  ];
  const retValue = enrichPatterns(patterns, true, 3);

  it('All added keys (rangeFollowingDays, dayDiff, dayString, allowedDiff, fromDate and untilDate) exists', () => {
    expect(retValue[0])
      .to.be.an('object')
      .that.has.all.keys(
        'activeDates',
        'allowedDiff',
        'code',
        'currentDate',
        'dayDiff',
        'dayString',
        'fromDate',
        'headsign',
        'lastRangeDate',
        'rangeFollowingDays',
        'stops',
        'tripsForDate',
        'untilDate',
      );
  });

  it("Pattern`s dayString is 'pe-la'", () => {
    expect(retValue[0].dayString).to.equal('pe-la');
  });
});
