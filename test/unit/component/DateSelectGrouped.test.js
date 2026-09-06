import React from 'react';
import { DateTime, Settings } from 'luxon';
import Select from 'react-select';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import DateSelectGrouped from '../../../app/component/stop/DateSelectGrouped';

describe('<DateSelectGrouped />', () => {
  const dateFormat = 'yyyyLLdd';
  const selectedDay = DateTime.fromISO('2019-01-02', { zone: 'UTC' });
  const dates = Array.from({ length: 60 }, (_, i) =>
    DateTime.fromISO('2019-01-01', { zone: 'UTC' }).plus({ days: i }),
  );

  const defaultProps = {
    startDate: DateTime.fromISO('2019-01-01', { zone: 'UTC' }),
    selectedDay,
    dateFormat,
    dates,
    onDateChange: value => value,
  };

  beforeEach(() => {
    Settings.now = () => new Date('2019-01-01T00:00:00Z').getTime();
    Settings.defaultZone = 'UTC';
  });

  afterEach(() => {
    Settings.defaultLocale = 'en';
    Settings.defaultZone = 'system';
    Settings.now = () => Date.now();
  });

  it('should render 60 options', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const { options } = wrapper.find(Select).props();
    const totalOptions = options.reduce(
      (count, group) => count + group.options.length,
      0,
    );
    expect(totalOptions).toBe(60);
  });

  it('should render today and tomorrow as text, others as weekday abbreviation with date', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const { options } = wrapper.find(Select).props();
    const flatOptions = options.reduce(
      (acc, group) => acc.concat(group.options),
      [],
    );

    expect(flatOptions[0].textLabel).toBe('Today');
    expect(flatOptions[1].textLabel).toBe('Tomorrow');
  });

  it('should have selectedDate selected', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const selectValue = wrapper.find(Select).props().value;
    expect(selectValue.value).toBe('20190102');
  });

  it('should call onDateChange when a date is selected', () => {
    const onDateChange = vi.fn();
    const wrapper = mountWithIntl(
      <DateSelectGrouped {...defaultProps} onDateChange={onDateChange} />,
    );

    const newDate = '20190103';
    const selectComponent = wrapper.find(Select);
    selectComponent.props().onChange({ value: newDate });

    expect(onDateChange).toHaveBeenCalledOnce();
    expect(onDateChange).toHaveBeenCalledWith(newDate);
  });

  it('should generate 60 days when no dates provided', () => {
    const propsWithoutDates = {
      startDate: DateTime.fromISO('2019-01-01', { zone: 'UTC' }),
      selectedDay,
      dateFormat,
      onDateChange: value => value,
    };

    const wrapper = mountWithIntl(<DateSelectGrouped {...propsWithoutDates} />);
    const { options } = wrapper.find(Select).props();
    const totalOptions = options.reduce(
      (count, group) => count + group.options.length,
      0,
    );

    expect(totalOptions).toBe(60);
  });

  it('should generate dates from startDate when no dates provided', () => {
    const propsWithoutDates = {
      startDate: DateTime.fromISO('2019-01-05', { zone: 'UTC' }),
      selectedDay: DateTime.fromISO('2019-01-05', { zone: 'UTC' }),
      dateFormat,
      onDateChange: value => value,
    };

    const wrapper = mountWithIntl(<DateSelectGrouped {...propsWithoutDates} />);
    const { options } = wrapper.find(Select).props();
    const flatOptions = options.reduce(
      (acc, group) => acc.concat(group.options),
      [],
    );

    expect(flatOptions[0].value).toBe('20190105');
  });

  it('should return no options when dates array is empty', () => {
    const propsWithEmptyDates = {
      ...defaultProps,
      dates: [],
    };

    const wrapper = mountWithIntl(
      <DateSelectGrouped {...propsWithEmptyDates} />,
    );
    const { options } = wrapper.find(Select).props();
    const totalOptions = options.reduce(
      (count, group) => count + group.options.length,
      0,
    );

    expect(totalOptions).toBe(0);
  });

  it('should select first option when selectedDay is undefined', () => {
    const propsWithoutSelected = {
      ...defaultProps,
      selectedDay: undefined,
    };

    const wrapper = mountWithIntl(
      <DateSelectGrouped {...propsWithoutSelected} />,
    );
    const selectValue = wrapper.find(Select).props().value;

    expect(selectValue).not.toBe(undefined);
    expect(selectValue.value).toBe('20190101');
  });

  it('should select first option when selectedDay is invalid', () => {
    const propsWithInvalidSelected = {
      ...defaultProps,
      selectedDay: DateTime.invalid('invalid'),
    };

    const wrapper = mountWithIntl(
      <DateSelectGrouped {...propsWithInvalidSelected} />,
    );
    const selectValue = wrapper.find(Select).props().value;

    expect(selectValue.value).toBe('20190101');
  });

  it('should group dates by week', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const { options } = wrapper.find(Select).props();

    expect(options.length).toBeGreaterThan(1);
    expect(options[0]).toHaveProperty('label');
    expect(options[0]).toHaveProperty('options');
    expect(options[0].options).toBeInstanceOf(Array);
  });

  it('should have "This week" as first group label', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const { options } = wrapper.find(Select).props();

    expect(options[0].label).toBe('This week');
  });

  it('should include accessibility labels in options', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const { options } = wrapper.find(Select).props();
    const firstOption = options[0].options[0];

    expect(firstOption).toHaveProperty('ariaLabel');
    expect(typeof firstOption.ariaLabel).toBe('string');
  });

  it('should pass closeMenuOnSelect prop to Select', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const selectProps = wrapper.find(Select).props();

    expect(selectProps.closeMenuOnSelect).toBe(true);
  });

  it('should set isSearchable to false', () => {
    const wrapper = mountWithIntl(<DateSelectGrouped {...defaultProps} />);
    const selectProps = wrapper.find(Select).props();

    expect(selectProps.isSearchable).toBe(false);
  });

  it('should not recompute when startDate is recreated with same date value', () => {
    // This test verifies optimization.
    const startDate1 = DateTime.fromISO('2019-01-05', { zone: 'UTC' });
    const propsWithStartDate = {
      startDate: startDate1,
      selectedDay: DateTime.fromISO('2019-01-05', { zone: 'UTC' }),
      dateFormat,
      onDateChange: value => value,
    };

    const wrapper = mountWithIntl(
      <DateSelectGrouped {...propsWithStartDate} />,
    );
    const { options: options1 } = wrapper.find(Select).props();
    const firstOptionBefore = options1[0].options[0].value;

    // Create new DateTime with same date (different reference)
    const startDate2 = DateTime.fromISO('2019-01-05', { zone: 'UTC' });
    wrapper.setProps({ startDate: startDate2 });
    wrapper.update();

    const { options: options2 } = wrapper.find(Select).props();
    const firstOptionAfter = options2[0].options[0].value;

    expect(firstOptionBefore).toBe(firstOptionAfter);
    expect(firstOptionBefore).toBe('20190105');

    expect(options1).toBe(options2);
  });
});
