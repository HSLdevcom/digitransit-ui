import { DateTime, Settings } from 'luxon';
import {
  formatDateLabel,
  formatWeekLabel,
  processDates,
  groupDatesByWeek,
  generateDateRange,
  extractSelectedValue,
} from '../../../app/util/dateSelectUtils';

describe('dateSelectUtils', () => {
  const dateFormat = 'yyyyLLdd';
  let mockIntl;

  beforeEach(() => {
    Settings.now = () => new Date('2024-01-15T10:00:00Z').getTime();
    Settings.defaultZone = 'UTC';

    mockIntl = {
      formatMessage: ({ id, defaultMessage }, values) => {
        const messages = {
          today: 'Today',
          tomorrow: 'Tomorrow',
          'this-week': 'This week',
          'next-week': 'Next week',
          'week-number': `Week ${values?.number || ''}`,
        };
        return messages[id] || defaultMessage;
      },
      locale: 'en',
    };
  });

  afterEach(() => {
    Settings.defaultLocale = 'en';
    Settings.defaultZone = 'system';
    Settings.now = () => Date.now();
  });

  describe('formatDateLabel', () => {
    it('should return "Today" for today\'s date', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const date = DateTime.fromISO('2024-01-15', { zone: 'UTC' });

      const result = formatDateLabel(date, today, tomorrow, mockIntl);

      expect(result).toBe('Today');
    });

    it('should return "Tomorrow" for tomorrow\'s date', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const date = DateTime.fromISO('2024-01-16', { zone: 'UTC' });

      const result = formatDateLabel(date, today, tomorrow, mockIntl);

      expect(result).toBe('Tomorrow');
    });

    it('should return formatted date for other dates', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const date = DateTime.fromISO('2024-01-20', { zone: 'UTC' });

      const result = formatDateLabel(date, today, tomorrow, mockIntl);

      expect(result).toBe('Sat 20.1.');
    });
  });

  describe('formatWeekLabel', () => {
    it('should return "This week" for current week', () => {
      const currentWeek = 3;
      const weekNum = 3;

      const result = formatWeekLabel(weekNum, currentWeek, mockIntl);

      expect(result).toBe('This week');
    });

    it('should return "Next week" for next week', () => {
      const currentWeek = 3;
      const weekNum = 4;

      const result = formatWeekLabel(weekNum, currentWeek, mockIntl);

      expect(result).toBe('Next week');
    });

    it('should return week number for other weeks', () => {
      const currentWeek = 3;
      const weekNum = 5;

      const result = formatWeekLabel(weekNum, currentWeek, mockIntl);

      expect(result).toBe('Week 5');
    });
  });

  describe('processDates', () => {
    it('should process dates with correct labels and values', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const dates = [
        DateTime.fromISO('2024-01-15', { zone: 'UTC' }),
        DateTime.fromISO('2024-01-16', { zone: 'UTC' }),
        DateTime.fromISO('2024-01-17', { zone: 'UTC' }),
      ];

      const result = processDates(dates, today, tomorrow, dateFormat, mockIntl);

      expect(result).toHaveLength(3);
      expect(result[0].textLabel).toBe('Today');
      expect(result[0].value).toBe('20240115');
      expect(result[1].textLabel).toBe('Tomorrow');
      expect(result[1].value).toBe('20240116');
      expect(result[2].value).toBe('20240117');
    });

    it('should include dateObj and weekNumber in processed dates', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const dates = [DateTime.fromISO('2024-01-15', { zone: 'UTC' })];

      const result = processDates(dates, today, tomorrow, dateFormat, mockIntl);

      expect(result[0]).toHaveProperty('dateObj');
      expect(result[0]).toHaveProperty('weekNumber');
      expect(typeof result[0].weekNumber).toBe('number');
    });
  });

  describe('groupDatesByWeek', () => {
    it('should group dates by week number', () => {
      const processedDates = [
        {
          value: '20240115',
          textLabel: 'Mon 15.1.',
          ariaLabel: 'Monday 15.1.',
          weekNumber: 3,
          dateObj: DateTime.fromISO('2024-01-15'),
        },
        {
          value: '20240116',
          textLabel: 'Tue 16.1.',
          ariaLabel: 'Tuesday 16.1.',
          weekNumber: 3,
          dateObj: DateTime.fromISO('2024-01-16'),
        },
        {
          value: '20240122',
          textLabel: 'Mon 22.1.',
          ariaLabel: 'Monday 22.1.',
          weekNumber: 4,
          dateObj: DateTime.fromISO('2024-01-22'),
        },
      ];

      const result = groupDatesByWeek(processedDates, 3, mockIntl);

      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('This week');
      expect(result[0].options).toHaveLength(2);
      expect(result[1].label).toBe('Next week');
      expect(result[1].options).toHaveLength(1);
    });

    it('should include accessibility labels in grouped options', () => {
      const processedDates = [
        {
          value: '20240115',
          textLabel: 'Mon 15.1.',
          ariaLabel: 'Monday 15.1.',
          weekNumber: 3,
          dateObj: DateTime.fromISO('2024-01-15', { zone: 'UTC' }),
        },
      ];

      const result = groupDatesByWeek(processedDates, 3, mockIntl);

      expect(result[0].options[0]).toHaveProperty('ariaLabel');
      expect(result[0].options[0].ariaLabel).toBe('Monday 15.1.');
    });

    it('should sort weeks in ascending order', () => {
      const processedDates = [
        {
          value: '20240129',
          textLabel: 'Mon 29.1.',
          ariaLabel: 'Monday 29.1.',
          weekNumber: 5,
          dateObj: DateTime.fromISO('2024-01-29'),
        },
        {
          value: '20240115',
          textLabel: 'Mon 15.1.',
          ariaLabel: 'Monday 15.1.',
          weekNumber: 3,
          dateObj: DateTime.fromISO('2024-01-15'),
        },
        {
          value: '20240122',
          textLabel: 'Mon 22.1.',
          ariaLabel: 'Monday 22.1.',
          weekNumber: 4,
          dateObj: DateTime.fromISO('2024-01-22'),
        },
      ];

      const result = groupDatesByWeek(processedDates, 3, mockIntl);

      expect(result).toHaveLength(3);
      expect(result[0].label).toBe('This week');
      expect(result[1].label).toBe('Next week');
      expect(result[2].label).toBe('Week 5');
    });
  });

  describe('generateDateRange', () => {
    it('should generate specified number of days from start date', () => {
      const startDate = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const numberOfDays = 7;

      const result = generateDateRange(startDate, numberOfDays, 'en');

      expect(result).toHaveLength(7);
      expect(result[0].toISODate()).toBe('2024-01-15');
      expect(result[6].toISODate()).toBe('2024-01-21');
    });

    it('should set correct locale', () => {
      const startDate = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const numberOfDays = 3;

      const result = generateDateRange(startDate, numberOfDays, 'fi');

      expect(result[0].locale).toBe('fi');
    });

    it('should normalize dates to start of day', () => {
      const startDate = DateTime.fromISO('2024-01-15T15:30:00', {
        zone: 'UTC',
      });
      const numberOfDays = 2;

      const result = generateDateRange(startDate, numberOfDays, 'en');

      expect(result[0].hour).toBe(0);
      expect(result[0].minute).toBe(0);
      expect(result[0].second).toBe(0);
    });
  });

  describe('extractSelectedValue', () => {
    it('should extract formatted value from valid DateTime', () => {
      const selectedDay = DateTime.fromISO('2024-01-15', { zone: 'UTC' });

      const result = extractSelectedValue(selectedDay, dateFormat);

      expect(result).toBe('20240115');
    });

    it('should return undefined for invalid DateTime', () => {
      const invalidDate = DateTime.invalid('invalid');

      const result = extractSelectedValue(invalidDate, dateFormat);

      expect(result).toBe(undefined);
    });

    it('should return undefined for null', () => {
      const result = extractSelectedValue(null, dateFormat);

      expect(result).toBe(undefined);
    });

    it('should return undefined for undefined', () => {
      const result = extractSelectedValue(undefined, dateFormat);

      expect(result).toBe(undefined);
    });

    it('should return undefined for non-DateTime objects', () => {
      const result = extractSelectedValue('2024-01-15', dateFormat);

      expect(result).toBe(undefined);
    });
  });
});
