import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import moment from 'moment';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import configureMoment from '../../../app/util/configure-moment';
import { Component as TimeSelectorContainer } from '../../../app/component/TimeSelectorContainer';

describe('<TimeSelectorContainer />', () => {
  const defaultProps = {
    serviceTimeRange: {
      start: 1546304401, //  Tuesday, January 1, 2019 1:00:01 AM GMT
      end: 1550192401, //  Friday, February 15, 2019 1:00:01 AM GMT
    },
    time: moment.unix(1546328253), // Tuesday, January 1, 2019 7:37:33 AM GMT
    now: moment.unix(1546307253), // Tuesday, January 1, 2019 1:47:33 AM GMT
  };

  const startUnix = moment.unix(defaultProps.serviceTimeRange.start);
  const endUnix = moment.unix(defaultProps.serviceTimeRange.end);

  after(() => {
    moment.locale('en');
    moment.tz.setDefault();
  });

  it('should render as many options as there are days between start and end including start but excluding end', () => {
    const wrapper = mountWithIntl(<TimeSelectorContainer {...defaultProps} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const days = endUnix.diff(startUnix, 'days');
    expect(wrapper.find('option')).to.have.lengthOf(days);
  });

  it('should render today and tomorrow as text, others as weekday abbreviation with date', () => {
    const wrapper = mountWithIntl(<TimeSelectorContainer {...defaultProps} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    const options = wrapper.find('option');

    expect(options.at(0).text()).to.equal('Today');
    expect(options.at(1).text()).to.equal('Tomorrow');
    expect(options.at(2).text()).to.equal('Th 3.1.');
    expect(options.at(44).text()).to.equal('Th 14.2.');
  });

  it('should display start date as tomorrow if now is day before', () => {
    const nowDayBeforeStartProps = {
      ...defaultProps,
      now: startUnix.subtract(1, 'd'),
    };
    const wrapper = mountWithIntl(
      <TimeSelectorContainer {...nowDayBeforeStartProps} />,
      {
        context: { ...mockContext },
        childContextTypes: { ...mockChildContextTypes },
      },
    );
    const options = wrapper.find('option');

    expect(options.at(0).text()).to.equal('Tomorrow');
  });

  it('should display start date as weekday abbreviation with date if now is two days before', () => {
    const nowDayBeforeStartProps = {
      ...defaultProps,
      now: startUnix.subtract(2, 'd'),
    };
    const wrapper = mountWithIntl(
      <TimeSelectorContainer {...nowDayBeforeStartProps} />,
      {
        context: { ...mockContext },
        childContextTypes: { ...mockChildContextTypes },
      },
    );
    const options = wrapper.find('option');

    expect(options.at(0).text()).to.equal('Tu 1.1.');
  });

  it('should use moment locale for weekday abbreviation', () => {
    const configWithMoment = {
      moment: {
        relativeTimeThreshold: {
          seconds: 55,
          minutes: 59,
          hours: 23,
          days: 26,
          months: 11,
        },
      },
      timezoneData:
        'Europe/Helsinki|EET EEST|-20 -30|01010101010101010101010|1BWp0 1qM0 WM0 1qM0 ' +
        'WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|35e5',
    };
    configureMoment('fi', configWithMoment);

    const wrapper = mountWithIntl(<TimeSelectorContainer {...defaultProps} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    const options = wrapper.find('option');

    expect(options.at(2).text()).to.equal('to 3.1.');
  });

  it('should have time prop as select value', () => {
    const wrapper = mountWithIntl(<TimeSelectorContainer {...defaultProps} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    const selectValueAsInt = parseInt(
      wrapper
        .find('select')
        .at(0)
        .props().value,
      10,
    );

    expect(selectValueAsInt).to.equal(defaultProps.time.unix());
  });
});
