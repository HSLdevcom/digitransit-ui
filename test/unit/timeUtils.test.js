import { expect } from 'chai';
import { describe, it } from 'mocha';
import moment from 'moment';
import { validateServiceTimeRange } from '../../app/util/timeUtils';

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
      test(validateServiceTimeRange(range, now));
    });

    it('should fix invalid time range', () => {
      const range = {
        start: now + 3600, // future
        end: now - 3600, // past
      };
      test(validateServiceTimeRange(range, now));
    });

    it('should not change the days of a proper time range', () => {
      const range = {
        start: now - 3600 * 24, // yesterday
        end: now + 3600 * 24 * 7, // next week
      };
      const validated = validateServiceTimeRange(range, now);
      test(validated);
      expect(moment.unix(validated.start).dayOfYear()).to.equal(
        moment.unix(range.start).dayOfYear(),
      );
      expect(moment.unix(validated.end).dayOfYear()).to.equal(
        moment.unix(range.end).dayOfYear(),
      );
    });

    it('should not return too long range', () => {
      const range = {
        start: now - 3600 * 24 * 365 * 2, // 2 years in the past
        end: now + 3600 * 24 * 365 * 2,
      };
      const validated = validateServiceTimeRange(range, now);
      test(validateServiceTimeRange(range, now));
      expect(moment.unix(validated.start).dayOfYear()).to.be.below(
        moment.unix(range.start).dayOfYear(),
      );
      expect(moment.unix(validated.end).dayOfYear()).to.be.above(
        moment.unix(range.end).dayOfYear(),
      );
    });
  });
});
