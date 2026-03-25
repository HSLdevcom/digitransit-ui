import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
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

      expect(result).to.equal('Today');
    });

    it('should return "Tomorrow" for tomorrow\'s date', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const date = DateTime.fromISO('2024-01-16', { zone: 'UTC' });

      const result = formatDateLabel(date, today, tomorrow, mockIntl);

      expect(result).to.equal('Tomorrow');
    });

    it('should return formatted date for other dates', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const date = DateTime.fromISO('2024-01-20', { zone: 'UTC' });

      const result = formatDateLabel(date, today, tomorrow, mockIntl);

      expect(result).to.equal('Sat 20.1.');
    });
  });

  describe('formatWeekLabel', () => {
    it('should return "This week" for current week', () => {
      const currentWeek = 3;
      const weekNum = 3;

      const result = formatWeekLabel(weekNum, currentWeek, mockIntl);

      expect(result).to.equal('This week');
    });

    it('should return "Next week" for next week', () => {
      const currentWeek = 3;
      const weekNum = 4;

      const result = formatWeekLabel(weekNum, currentWeek, mockIntl);

      expect(result).to.equal('Next week');
    });

    it('should return week number for other weeks', () => {
      const currentWeek = 3;
      const weekNum = 5;

      const result = formatWeekLabel(weekNum, currentWeek, mockIntl);

      expect(result).to.equal('Week 5');
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

      expect(result).to.have.lengthOf(3);
      expect(result[0].textLabel).to.equal('Today');
      expect(result[0].value).to.equal('20240115');
      expect(result[1].textLabel).to.equal('Tomorrow');
      expect(result[1].value).to.equal('20240116');
      expect(result[2].value).to.equal('20240117');
    });

    it('should include dateObj and weekNumber in processed dates', () => {
      const today = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const tomorrow = today.plus({ days: 1 });
      const dates = [DateTime.fromISO('2024-01-15', { zone: 'UTC' })];

      const result = processDates(dates, today, tomorrow, dateFormat, mockIntl);

      expect(result[0]).to.have.property('dateObj');
      expect(result[0]).to.have.property('weekNumber');
      expect(result[0].weekNumber).to.be.a('number');
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

      expect(result).to.have.lengthOf(2);
      expect(result[0].label).to.equal('This week');
      expect(result[0].options).to.have.lengthOf(2);
      expect(result[1].label).to.equal('Next week');
      expect(result[1].options).to.have.lengthOf(1);
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

      expect(result[0].options[0]).to.have.property('ariaLabel');
      expect(result[0].options[0].ariaLabel).to.equal('Monday 15.1.');
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

      expect(result).to.have.lengthOf(3);
      expect(result[0].label).to.equal('This week');
      expect(result[1].label).to.equal('Next week');
      expect(result[2].label).to.equal('Week 5');
    });
  });

  describe('generateDateRange', () => {
    it('should generate specified number of days from start date', () => {
      const startDate = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const numberOfDays = 7;

      const result = generateDateRange(startDate, numberOfDays, 'en');

      expect(result).to.have.lengthOf(7);
      expect(result[0].toISODate()).to.equal('2024-01-15');
      expect(result[6].toISODate()).to.equal('2024-01-21');
    });

    it('should set correct locale', () => {
      const startDate = DateTime.fromISO('2024-01-15', { zone: 'UTC' });
      const numberOfDays = 3;

      const result = generateDateRange(startDate, numberOfDays, 'fi');

      expect(result[0].locale).to.equal('fi');
    });

    it('should normalize dates to start of day', () => {
      const startDate = DateTime.fromISO('2024-01-15T15:30:00', {
        zone: 'UTC',
      });
      const numberOfDays = 2;

      const result = generateDateRange(startDate, numberOfDays, 'en');

      expect(result[0].hour).to.equal(0);
      expect(result[0].minute).to.equal(0);
      expect(result[0].second).to.equal(0);
    });
  });

  describe('extractSelectedValue', () => {
    it('should extract formatted value from valid DateTime', () => {
      const selectedDay = DateTime.fromISO('2024-01-15', { zone: 'UTC' });

      const result = extractSelectedValue(selectedDay, dateFormat);

      expect(result).to.equal('20240115');
    });

    it('should return undefined for invalid DateTime', () => {
      const invalidDate = DateTime.invalid('invalid');

      const result = extractSelectedValue(invalidDate, dateFormat);

      expect(result).to.equal(undefined);
    });

    it('should return undefined for null', () => {
      const result = extractSelectedValue(null, dateFormat);

      expect(result).to.equal(undefined);
    });

    it('should return undefined for undefined', () => {
      const result = extractSelectedValue(undefined, dateFormat);

      expect(result).to.equal(undefined);
    });

    it('should return undefined for non-DateTime objects', () => {
      const result = extractSelectedValue('2024-01-15', dateFormat);

      expect(result).to.equal(undefined);
    });
  });
});
