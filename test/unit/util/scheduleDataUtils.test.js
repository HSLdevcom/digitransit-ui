import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { DateTime, Settings } from 'luxon';
import { buildAvailableDates } from '../../../app/component/routepage/schedule/scheduleDataUtils';
import { DATE_FORMAT } from '../../../app/constants';

describe('scheduleDataUtils', () => {
  describe('buildAvailableDates', () => {
    const fixedNow = DateTime.fromISO('2024-01-15T10:00:00');

    beforeEach(() => {
      Settings.now = () => fixedNow.toMillis();
    });

    afterEach(() => {
      Settings.now = () => Date.now();
    });

    it('should return an array of DateTime objects', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.instanceOf(DateTime);
      expect(result[1]).to.be.instanceOf(DateTime);
    });

    it('should handle single week of departures', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk1wed: [{ departureStoptime: { scheduledDeparture: 32400 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.have.lengthOf(3);
    });

    it('should handle multiple weeks with same schedule', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk2mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.have.lengthOf(4);
    });

    it('should handle multiple weeks with different schedules', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
        wk2sat: [{ departureStoptime: { scheduledDeparture: 32400 } }],
        wk2sun: [{ departureStoptime: { scheduledDeparture: 34200 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(4);
    });

    it('should filter out empty departure arrays', () => {
      const departures = {
        wk1mon: [],
        wk1tue: [],
        wk2mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.have.lengthOf(1);
    });

    it('should calculate dates relative to current week', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.have.lengthOf(1);
      const expectedDate = fixedNow.startOf('week');
      expect(result[0].toFormat(DATE_FORMAT)).to.equal(
        expectedDate.toFormat(DATE_FORMAT),
      );
    });

    it('should return empty array when departures is null', () => {
      const result = buildAvailableDates(null);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('should return empty array when departures is undefined', () => {
      const result = buildAvailableDates(undefined);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('should handle empty departure object', () => {
      const departures = {};

      const result = buildAvailableDates(departures);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('should handle all empty departure arrays', () => {
      const departures = {
        wk1mon: [],
        wk1tue: [],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });

    it('should deduplicate dates with same key', () => {
      // If multiple weeks have departures on the same day of week,
      // they should create separate dates
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk2mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.have.lengthOf(2);
      expect(result[0].toFormat(DATE_FORMAT)).to.not.equal(
        result[1].toFormat(DATE_FORMAT),
      );
    });

    it('should ignore invalid schedule keys', () => {
      const departures = {
        wk1mon: [{ departureStoptime: { scheduledDeparture: 28800 } }],
        'invalid-key': [{ departureStoptime: { scheduledDeparture: 28800 } }],
        wk1tue: [{ departureStoptime: { scheduledDeparture: 30600 } }],
      };

      const result = buildAvailableDates(departures);

      expect(result).to.have.lengthOf(2);
    });
  });
});
