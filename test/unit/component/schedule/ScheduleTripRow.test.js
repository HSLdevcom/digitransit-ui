import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow } from 'enzyme';

import Icon from '@digitransit-component/digitransit-component-icon';
import ScheduleTripRow from '../../../../app/component/routepage/schedule/ScheduleTripRow';

describe('<ScheduleTripRow />', () => {
  const defaultProps = {
    departureTime: '08:00',
    arrivalTime: '08:30',
    isCanceled: false,
  };

  describe('Rendering times', () => {
    it('should display departure and arrival times', () => {
      const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
      expect(wrapper.find('.trip-from').text()).to.equal('08:00');
      expect(wrapper.find('.trip-to').text()).to.equal('08:30');
    });

    it('should render arrow icon separator', () => {
      const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
      const icon = wrapper.find(Icon);
      expect(icon).to.have.lengthOf(1);
      expect(icon.prop('img')).to.equal('arrow');
    });
  });

  describe('Canceled trips', () => {
    it('should apply canceled styling when trip is canceled', () => {
      const props = { ...defaultProps, isCanceled: true };
      const wrapper = shallow(<ScheduleTripRow {...props} />);

      expect(wrapper.find('.trip-from').hasClass('canceled')).to.equal(true);
      expect(wrapper.find('.trip-to').hasClass('canceled')).to.equal(true);
    });

    it('should not apply canceled styling when isCanceled is false', () => {
      const props = { ...defaultProps, isCanceled: false };
      const wrapper = shallow(<ScheduleTripRow {...props} />);

      expect(wrapper.find('.trip-from').hasClass('canceled')).to.equal(false);
      expect(wrapper.find('.trip-to').hasClass('canceled')).to.equal(false);
    });
  });

  describe('Accessibility', () => {
    it('should have listitem role for screen readers', () => {
      const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
      const row = wrapper.find('[role="listitem"]');
      expect(row).to.have.lengthOf(1);
    });

    it('should be keyboard accessible with tabIndex', () => {
      const wrapper = shallow(<ScheduleTripRow {...defaultProps} />);
      const row = wrapper.find('[role="listitem"]');
      expect(row.prop('tabIndex')).to.equal(0);
    });
  });
});
