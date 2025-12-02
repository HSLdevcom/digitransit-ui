import { expect } from 'chai';
import { describe, it } from 'mocha';
import { DateTime } from 'luxon';
import {
  validateServiceTimeRange,
  RANGE_PAST,
  convertTo24HourFormat,
  getStartTime,
  isTomorrow,
  isToday,
} from '../../../app/util/timeUtils';

const now = DateTime.now();

const test = validated => {
  expect(validated).to.be.an('object');
  expect(validated).to.have.own.property('start');
  expect(validated).to.have.own.property('end');
  expect(validated.start).to.be.at.most(now.toUnixInteger());
  expect(validated.end).to.be.at.least(now.toUnixInteger());
};

describe('timeUtils', () => {
  describe('validateServiceTimeRange', () => {
    it('should return valid default time range from undefined input', () => {
      const range = null;
      const futureDays = null; // DT-3175
      test(validateServiceTimeRange(futureDays, range, now.toUnixInteger()));
    });

    it('should fix invalid time range', () => {
      const range = {
        start: now.toUnixInteger() + 3600, // future
        end: now.toUnixInteger() - 3600, // past
      };
      const futureDays = null; // DT-3175
      test(validateServiceTimeRange(futureDays, range, now.toUnixInteger()));
    });

    it('should not change the days of a proper time range', () => {
      const range = {
        start: now.toUnixInteger() - 3600 * 24, // yesterday
        end: now.toUnixInteger() + 3600 * 24 * 7, // next week
      };
      const futureDays = null; // DT-3175
      const validated = validateServiceTimeRange(
        futureDays,
        range,
        now.toUnixInteger(),
      );
      test(validated);
      expect(DateTime.fromSeconds(validated.start).ordinal).to.equal(
        DateTime.fromSeconds(range.start).ordinal,
      );
      expect(DateTime.fromSeconds(validated.end).ordinal).to.equal(
        DateTime.fromSeconds(range.end).ordinal,
      );
    });

    it('should not return too long a range', () => {
      const range = {
        start: now.toUnixInteger() - 3600 * 24 * 365 * 2, // 2 years in the past
        end: now.toUnixInteger() + 3600 * 24 * 365 * 2,
      };
      const RANGE_FUTURE = 30; // DT-3175
      const validated = validateServiceTimeRange(
        RANGE_FUTURE,
        range,
        now.toUnixInteger(),
      );
      test(validated);
      expect((validated.end - validated.start) / 1000 / 86400).to.be.at.most(
        RANGE_FUTURE + RANGE_PAST + 1,
      ); // +1 for today
    });
  });
  describe('convertTo24HourFormat', () => {
    it('should just add : to times under 2400', () => {
      expect(convertTo24HourFormat('2355')).to.equal('23:55');
    });
    it('should change format to 24 hour system after midnight', () => {
      expect(convertTo24HourFormat('2630')).to.equal('02:30');
    });
    it('should change format to 00:00 at midnight', () => {
      expect(convertTo24HourFormat('2400')).to.equal('00:00');
    });
    it('should return given parameter if already correct format', () => {
      expect(convertTo24HourFormat('23:45')).to.equal('23:45');
    });
  });
  describe('getStartTime', () => {
    it('should convert zero seconds to 0000', () => {
      expect(getStartTime(0)).to.equal('0000');
    });
    it('should convert seconds to HHmm', () => {
      expect(getStartTime(5 * 3600 + 32 * 60)).to.equal('0532');
    });
  });
  describe('isTomorrow', () => {
    it('should return true if startTime is tomorrow', () => {
      const startTime = now.plus({ days: 1 }).toMillis();
      expect(isTomorrow(startTime)).to.equal(true);
    });
    it('should return false if startTime is not tomorrow', () => {
      const startTime = now.plus({ days: 2 }).toMillis();
      expect(isTomorrow(startTime)).to.equal(false);
    });
    it('should return false if refTime is not today', () => {
      const startTime = now.plus({ days: 1 }).toMillis();
      const refTime = now.minus({ days: 2 }).toMillis();
      expect(isTomorrow(startTime, refTime)).to.equal(false);
    });
    it('should return false if startTime is one week and one day from today', () => {
      const startTime = now.plus({ days: 1 + 7 }).toMillis();
      expect(isTomorrow(startTime)).to.equal(false);
    });
  });
  describe('isToday', () => {
    it('should return true if startTime is today', () => {
      const startTime = now.toMillis();
      expect(isToday(startTime)).to.equal(true);
    });
  });
});
