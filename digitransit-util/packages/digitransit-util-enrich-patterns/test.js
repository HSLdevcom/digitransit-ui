/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DateTime } from 'luxon';
import enrichPatterns from '.';

const DATE_FORMAT = 'yyyyLLdd';

describe('Testing @digitransit-util/digitransit-util-enrich-patterns module', () => {
  const nextFridaysAndSaturdays = [];
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${DateTime.now()
        .set({ weekday: 5 })
        .toFormat(DATE_FORMAT)}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${DateTime.now()
        .set({ weekday: 6 })
        .toFormat(DATE_FORMAT)}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${DateTime.now()
        .set({ weekday: 5 + 7 })
        .toFormat(DATE_FORMAT)}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${DateTime.now()
        .set({ weekday: 6 + 7 })
        .toFormat(DATE_FORMAT)}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${DateTime.now()
        .set({ weekday: 5 + 14 })
        .toFormat(DATE_FORMAT)}"] }`,
    ),
  );
  nextFridaysAndSaturdays.push(
    JSON.parse(
      `{ "day": ["${DateTime.now()
        .set({ weekday: 6 + 14 })
        .toFormat(DATE_FORMAT)}"] }`,
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
