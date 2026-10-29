import { DateTime } from 'luxon';
import {
  convertTo24HourFormat,
  getStartTime,
  isTomorrow,
  isToday,
  getFutureText,
} from '../../../../utils/client/timeUtils';
import { createTestIntl } from '../../helpers/mock-providers';

const now = DateTime.now();

describe('timeUtils', () => {
  describe('convertTo24HourFormat', () => {
    it('should just add : to times under 2400', () => {
      expect(convertTo24HourFormat('2355')).toBe('23:55');
    });
    it('should change format to 24 hour system after midnight', () => {
      expect(convertTo24HourFormat('2630')).toBe('02:30');
    });
    it('should change format to 00:00 at midnight', () => {
      expect(convertTo24HourFormat('2400')).toBe('00:00');
    });
    it('should return given parameter if already correct format', () => {
      expect(convertTo24HourFormat('23:45')).toBe('23:45');
    });
  });
  describe('getStartTime', () => {
    it('should convert zero seconds to 0000', () => {
      expect(getStartTime(0)).toBe('0000');
    });
    it('should convert seconds to HHmm', () => {
      expect(getStartTime(5 * 3600 + 32 * 60)).toBe('0532');
    });
    it('should preserve service-day hours past midnight (>=24h) for real-time matching', () => {
      // GTFS trips starting after midnight keep hours >= 24 relative to the service day,
      // e.g. 25:30 for a trip departing at 01:30 the next calendar day.
      expect(getStartTime(25 * 3600 + 30 * 60)).toBe('2530');
    });
  });
  describe('isTomorrow', () => {
    it('should return true if startTime is tomorrow', () => {
      const startTime = now.plus({ days: 1 }).toMillis();
      expect(isTomorrow(startTime)).toBe(true);
    });
    it('should return false if startTime is not tomorrow', () => {
      const startTime = now.plus({ days: 2 }).toMillis();
      expect(isTomorrow(startTime)).toBe(false);
    });
    it('should return false if refTime is not today', () => {
      const startTime = now.plus({ days: 1 }).toMillis();
      const refTime = now.minus({ days: 2 }).toMillis();
      expect(isTomorrow(startTime, refTime)).toBe(false);
    });
    it('should return false if startTime is one week and one day from today', () => {
      const startTime = now.plus({ days: 1 + 7 }).toMillis();
      expect(isTomorrow(startTime)).toBe(false);
    });
  });
  describe('isToday', () => {
    it('should return true if startTime is today', () => {
      const startTime = now.toMillis();
      expect(isToday(startTime)).toBe(true);
    });
  });
  describe('getFutureText', () => {
    it('should format the weekday using the given intl locale', () => {
      const startTime = now.plus({ days: 2 }).toISO();
      const intl = createTestIntl({ locale: 'fi' });
      const finnishText = getFutureText(startTime, intl);
      expect(finnishText).toBe(
        DateTime.fromISO(startTime).setLocale('fi').toFormat('ccc d.L.'),
      );
    });
  });
});
