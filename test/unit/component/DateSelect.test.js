import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Settings } from 'luxon';

import { getDateOptions } from '../../../app/component/stop/DateSelect';

describe('<DateSelect />', () => {
  const defaultProps = {
    startDate: '20190101',
    selectedDate: '20190102',
    dateFormat: 'yyyyLLdd',
    onDateChange: event => event.target.value,
  };

  after(() => {
    Settings.defaultLocale = 'en';
    Settings.defaultZone = 'system';
  });

  it('should render 60 options', () => {
    const options = getDateOptions(
      defaultProps.startDate,
      defaultProps.dateFormat,
      defaultProps.selectedDate,
      ({ defaultMessage }) => defaultMessage,
    );
    expect(options).to.have.lengthOf(60);
  });

  it('should render today and tomorrow as text, others as weekday abbreviation with date', () => {
    const options = getDateOptions(
      defaultProps.startDate,
      defaultProps.dateFormat,
      defaultProps.selectedDate,
      ({ defaultMessage }) => defaultMessage,
    );
    expect(options[0].textLabel).to.equal('Today');
    expect(options[1].textLabel).to.equal('Tomorrow');
    expect(options[2].textLabel).to.equal('Thu 3.1.');
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
    expect(options[2].textLabel).to.equal('to 3.1.');
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
    ).to.not.equal(undefined);
  });
});
