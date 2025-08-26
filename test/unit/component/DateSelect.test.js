import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { Settings } from 'luxon';
import Select from 'react-select';

import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';
import DateSelect from '../../../app/component/stop/DateSelect';

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
    const wrapper = shallowWithIntl(<DateSelect {...defaultProps} />);
    expect(wrapper.find(Select).props().options).to.have.lengthOf(60);
  });

  it('should render today and tomorrow as text, others as weekday abbreviation with date', () => {
    const wrapper = mountWithIntl(<DateSelect {...defaultProps} />);
    const { options } = wrapper.find(Select).props();

    expect(options[0].textLabel).to.equal('Today');
    expect(options[1].textLabel).to.equal('Tomorrow');
    // expect(options[2].textLabel).to.equal('Th 3.1.');
    // expect(options[29].textLabel).to.equal('We 30.1.');
  });

  it('should use correct locale for weekday abbreviation', () => {
    Settings.defaultLocale = 'fi';
    Settings.defaultZone = 'Europe/Helsinki';

    const wrapper = mountWithIntl(<DateSelect {...defaultProps} />);
    const { options } = wrapper.find(Select).props();

    expect(options[2].textLabel).to.equal('to 3.1.');
  });

  it('should have selectedDate selected', () => {
    const wrapper = mountWithIntl(<DateSelect {...defaultProps} />);
    const selectValue = wrapper.find(Select).props().value;

    expect(selectValue).to.equal('20190102');
  });
});
