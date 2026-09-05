import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import enrichPatterns from './index.js';

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
    expect(retValue[0]).toBeTypeOf('object');
    expect(Object.keys(retValue[0])).toEqual(
      expect.arrayContaining([
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
      ]),
    );
  });

  it("Pattern`s dayString is 'pe-la'", () => {
    expect(retValue[0].dayString).toBe('pe-la');
  });
});
