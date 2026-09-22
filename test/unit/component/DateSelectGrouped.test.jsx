import React from 'react';
import { DateTime, Settings } from 'luxon';
import { renderWithProviders } from '../helpers/mock-providers';
import DateSelectGrouped, {
  handleDateSelectChange,
} from '../../../app/component/stop/DateSelectGrouped';
import {
  formatDateLabel,
  formatWeekLabel,
  generateDateRange,
  processDates,
  groupDatesByWeek,
} from '../../../utils/client/dateSelectUtils';

describe('<DateSelectGrouped />', () => {
  const dateFormat = 'yyyyLLdd';
  const today = DateTime.fromISO('2019-01-01', { zone: 'UTC' });
  const tomorrow = today.plus({ days: 1 });
  const intl = {
    formatMessage: ({ defaultMessage }) => defaultMessage,
  };

  beforeEach(() => {
    Settings.now = () => today.toMillis();
    Settings.defaultZone = 'UTC';
  });

  afterEach(() => {
    Settings.defaultLocale = 'en';
    Settings.defaultZone = 'Europe/Helsinki';
    Settings.now = () => Date.now();
  });

  it('should render the date selector heading and selected date', () => {
    const { container } = renderWithProviders(
      <DateSelectGrouped
        startDate={today}
        selectedDay={tomorrow}
        dateFormat={dateFormat}
        dates={[today, tomorrow]}
        onDateChange={() => {}}
      />,
    );
    expect(
      container.querySelector('.route-schedule-grouped-date-select-heading')
        .textContent,
    ).toContain('Select time');
    expect(
      container.querySelector('.route-schedule-grouped__single-value')
        .textContent,
    ).toContain('Tomorrow');
  });

  it('should select the first available date when selectedDay is undefined', () => {
    const { container } = renderWithProviders(
      <DateSelectGrouped
        startDate={today}
        dateFormat={dateFormat}
        dates={[today, tomorrow]}
        onDateChange={() => {}}
      />,
    );
    expect(
      container.querySelector('.route-schedule-grouped__single-value')
        .textContent,
    ).toContain('Today');
  });

  it('should select the first available date when selectedDay is invalid', () => {
    const { container } = renderWithProviders(
      <DateSelectGrouped
        startDate={today}
        selectedDay={DateTime.invalid('invalid')}
        dateFormat={dateFormat}
        dates={[today, tomorrow]}
        onDateChange={() => {}}
      />,
    );
    expect(
      container.querySelector('.route-schedule-grouped__single-value')
        .textContent,
    ).toContain('Today');
  });

  it('should generate 60 dates when no dates are provided', () => {
    expect(generateDateRange(today, 60, 'en')).toHaveLength(60);
  });

  it('should generate dates from startDate', () => {
    const startDate = DateTime.fromISO('2019-01-05', { zone: 'UTC' });
    expect(generateDateRange(startDate, 60, 'en')[0].toISODate()).toBe(
      '2019-01-05',
    );
  });

  it('should return no options for an empty dates array', () => {
    expect(processDates([], today, tomorrow, dateFormat, intl)).toHaveLength(0);
  });

  it('should label today and tomorrow', () => {
    expect(formatDateLabel(today, today, tomorrow, intl)).toBe('Today');
    expect(formatDateLabel(tomorrow, today, tomorrow, intl)).toBe('Tomorrow');
  });

  it('should create accessible date options', () => {
    const options = processDates([today], today, tomorrow, dateFormat, intl);
    expect(options[0].value).toBe('20190101');
    expect(typeof options[0].ariaLabel).toBe('string');
    expect(options[0].textLabel).toBe('Today');
  });

  it('should pass the selected date value to onDateChange', () => {
    let changedDate;
    handleDateSelectChange({ value: '20190102' }, value => {
      changedDate = value;
    });
    expect(changedDate).toBe('20190102');
  });

  it('should group dates by week', () => {
    const options = processDates(
      [today, tomorrow],
      today,
      tomorrow,
      dateFormat,
      intl,
    );
    const groups = groupDatesByWeek(options, today.weekNumber, intl);
    expect(groups[0].label).toBe('This week');
    expect(groups[0].options).toHaveLength(2);
  });

  it('should label the next week', () => {
    expect(formatWeekLabel(today.weekNumber + 1, today.weekNumber, intl)).toBe(
      'Next week',
    );
  });
});
