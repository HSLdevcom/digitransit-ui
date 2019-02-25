import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import StopPageActionBar from '../../../app/component/StopPageActionBar';

describe('<StopPageActionBar />', () => {
  it('should show print and weekly timetables when there is stopPDFURL defined', () => {
    const props = {
      stopPDFURL: 'https://timetabletest.com/stops/1140199.pdf',
      startDate: '20190110',
      selectedDate: '20190110',
      onDateChange: () => {},
    };
    const wrapper = mountWithIntl(<StopPageActionBar {...props} />);
    expect(wrapper.find('.print-timetable')).to.have.lengthOf(1);
    expect(wrapper.find('.print')).to.have.lengthOf(1);
  });

  it('should only show print timetables when there is no stopPDFURL defined', () => {
    const props = {
      stopPDFURL: null,
      startDate: '20190110',
      selectedDate: '20190110',
      onDateChange: () => {},
    };
    const wrapper = mountWithIntl(<StopPageActionBar {...props} />);
    expect(wrapper.find('.print-timetable')).to.have.lengthOf(0);
    expect(wrapper.find('.print')).to.have.lengthOf(1);
  });
});
