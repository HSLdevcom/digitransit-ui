import { describe, it, beforeEach, afterAll } from 'vitest';
import { Settings } from 'luxon';

import { getDateOptions } from '../../../app/component/stop/DateSelect';

describe('<DateSelect />', () => {
  const defaultProps = {
    startDate: '20190101',
    selectedDate: '20190102',
    dateFormat: 'yyyyLLdd',
    onDateChange: event => event.target.value,
  };

  // getDateOptions formats weekday abbreviations via Luxon's global
  // Settings.defaultLocale/defaultZone, so every test must pin these
  // explicitly instead of relying on whatever locale happened to be left
  // over from a previous test/test file (or the host machine's own locale,
  // which Luxon falls back to only when defaultLocale is unset) - otherwise
  // the assertions below are order- and environment-dependent.
  beforeEach(() => {
    Settings.defaultLocale = 'en';
    Settings.defaultZone = 'Europe/Helsinki';
  });

  afterAll(() => {
    Settings.defaultLocale = 'en';
    Settings.defaultZone = 'Europe/Helsinki';
  });

  it('should render 60 options', () => {
    const options = getDateOptions(
      defaultProps.startDate,
      defaultProps.dateFormat,
      defaultProps.selectedDate,
      ({ defaultMessage }) => defaultMessage,
    );
    expect(options).toHaveLength(60);
  });

  it('should render today and tomorrow as text, others as weekday abbreviation with date', () => {
    const options = getDateOptions(
      defaultProps.startDate,
      defaultProps.dateFormat,
      defaultProps.selectedDate,
      ({ defaultMessage }) => defaultMessage,
    );
    expect(options[0].textLabel).toBe('Today');
    expect(options[1].textLabel).toBe('Tomorrow');
    expect(options[2].textLabel).toBe('Thu 3.1.');
  });

  it('should use correct locale for weekday abbreviation', () => {
    Settings.defaultLocale = 'fi';
    Settings.defaultZone = 'Europe/Helsinki';

    const options = getDateOptions(
      defaultProps.startDate,
      defaultProps.dateFormat,
      defaultProps.selectedDate,
      ({ defaultMessage }) => defaultMessage,
    );
    expect(options[2].textLabel).toBe('to 3.1.');
  });

  it('should have selectedDate selected', () => {
    const options = getDateOptions(
      defaultProps.startDate,
      defaultProps.dateFormat,
      defaultProps.selectedDate,
      ({ defaultMessage }) => defaultMessage,
    );
    expect(
      options.find(option => option.value === defaultProps.selectedDate),
    ).toBeDefined();
  });
});
