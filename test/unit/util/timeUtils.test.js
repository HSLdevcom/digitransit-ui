import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';
import {
  validateServiceTimeRange,
  RANGE_PAST,
  convertTo24HourFormat,
} from '../../../app/util/timeUtils';

const now = moment().unix();

const test = validated => {
  expect(validated).to.be.an('object');
  expect(validated).to.have.own.property('start');
  expect(validated).to.have.own.property('end');
  expect(validated.start).to.be.at.most(now);
  expect(validated.end).to.be.at.least(now);
};

describe('timeUtils', () => {
  describe('validateServiceTimeRange', () => {
    it('should return valid default time range from undefined input', () => {
      const range = null;
      const futureDays = null; // DT-3175
      test(validateServiceTimeRange(futureDays, range, now));
    });

    it('should fix invalid time range', () => {
      const range = {
        start: now + 3600, // future
        end: now - 3600, // past
      };
      const futureDays = null; // DT-3175
      test(validateServiceTimeRange(futureDays, range, now));
    });

    it('should not change the days of a proper time range', () => {
      const range = {
        start: now - 3600 * 24, // yesterday
        end: now + 3600 * 24 * 7, // next week
      };
      const futureDays = null; // DT-3175
      const validated = validateServiceTimeRange(futureDays, range, now);
      test(validated);
      expect(moment.unix(validated.start).dayOfYear()).to.equal(
        moment.unix(range.start).dayOfYear(),
      );
      expect(moment.unix(validated.end).dayOfYear()).to.equal(
        moment.unix(range.end).dayOfYear(),
      );
    });

    it('should not return too long a range', () => {
      const range = {
        start: now - 3600 * 24 * 365 * 2, // 2 years in the past
        end: now + 3600 * 24 * 365 * 2,
      };
      const RANGE_FUTURE = 30; // DT-3175
      const validated = validateServiceTimeRange(RANGE_FUTURE, range, now);
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
});
