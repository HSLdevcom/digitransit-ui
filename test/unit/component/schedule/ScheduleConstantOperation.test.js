import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import ScheduleConstantOperation from '../../../../app/component/routepage/schedule/ScheduleConstantOperation';
import RouteControlPanel from '../../../../app/component/routepage/RouteControlPanel';
import { mockMatch } from '../../helpers/mock-router';

describe('<ScheduleConstantOperation />', () => {
  const defaultProps = {
    constantOperationInfo: {
      text: 'This route operates continuously 24/7.',
      link: 'https://example.com/route-info',
    },
    match: mockMatch,
    route: {
      gtfsId: 'HSL:1001',
      shortName: '1',
      longName: 'Route 1',
      mode: 'BUS',
      type: 3,
    },
    breakpoint: 'large',
  };

  it('should render RouteControlPanel', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const controlPanel = wrapper.find(RouteControlPanel);

    expect(controlPanel).to.have.lengthOf(1);
  });

  it('should display constant operation text', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const content = wrapper.find('.constant-operation-content');

    expect(content.text()).to.include('This route operates continuously 24/7.');
  });

  it('should open link in new tab', () => {
    const wrapper = shallow(<ScheduleConstantOperation {...defaultProps} />);
    const link = wrapper.find('a');

    expect(link.prop('target')).to.equal('_blank');
    expect(link.prop('rel')).to.equal('noreferrer');
  });

  it('should apply mobile class when breakpoint is not large', () => {
    const props = { ...defaultProps, breakpoint: 'small' };
    const wrapper = shallow(<ScheduleConstantOperation {...props} />);
    const container = wrapper.find('.route-schedule-container');
    expect(container.hasClass('mobile')).to.equal(true);
  });
});
