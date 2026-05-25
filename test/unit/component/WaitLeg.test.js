import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import WaitLeg from '../../../app/component/itinerary/WaitLeg';
import ItineraryCircleLineWithIcon from '../../../app/component/itinerary/ItineraryCircleLineWithIcon';

const defaultProps = {
  index: 1,
  focusAction: () => {},
  waitTime: 300,
  start: { scheduledTime: '2024-04-05T14:48:00.000Z' },
  leg: {
    from: { name: 'Stop A', viaLocationType: null },
    to: { name: 'Stop B', stop: { gtfsId: 'HSL:1234' } },
  },
};

describe('<WaitLeg />', () => {
  describe('hasPreviousTransitLeg prop threading', () => {
    it('should pass hasPreviousTransitLeg=true to ItineraryCircleLineWithIcon', () => {
      const wrapper = shallowWithIntl(
        <WaitLeg {...defaultProps} hasPreviousTransitLeg />,
      );
      expect(
        wrapper.find(ItineraryCircleLineWithIcon).prop('hasPreviousTransitLeg'),
      ).to.equal(true);
    });

    it('should pass hasPreviousTransitLeg=false to ItineraryCircleLineWithIcon by default', () => {
      const wrapper = shallowWithIntl(<WaitLeg {...defaultProps} />);
      expect(
        wrapper.find(ItineraryCircleLineWithIcon).prop('hasPreviousTransitLeg'),
      ).to.equal(false);
    });

    it('should pass hasPreviousTransitLeg=false when explicitly set to false', () => {
      const wrapper = shallowWithIntl(
        <WaitLeg {...defaultProps} hasPreviousTransitLeg={false} />,
      );
      expect(
        wrapper.find(ItineraryCircleLineWithIcon).prop('hasPreviousTransitLeg'),
      ).to.equal(false);
    });
  });

  describe('rendering', () => {
    it('should always render with modeClassName wait', () => {
      const wrapper = shallowWithIntl(<WaitLeg {...defaultProps} />);
      expect(
        wrapper.find(ItineraryCircleLineWithIcon).prop('modeClassName'),
      ).to.equal('wait');
    });

    it('should always pass isNotFirstLeg=true to ItineraryCircleLineWithIcon', () => {
      const wrapper = shallowWithIntl(<WaitLeg {...defaultProps} />);
      expect(
        wrapper.find(ItineraryCircleLineWithIcon).prop('isNotFirstLeg'),
      ).to.equal(true);
    });

    it('should pass the index prop through to ItineraryCircleLineWithIcon', () => {
      const wrapper = shallowWithIntl(<WaitLeg {...defaultProps} index={3} />);
      expect(wrapper.find(ItineraryCircleLineWithIcon).prop('index')).to.equal(
        3,
      );
    });

    it('should render the destination stop name', () => {
      const wrapper = shallowWithIntl(<WaitLeg {...defaultProps} />);
      expect(wrapper.find('.itinerary-row').text()).to.include('Stop B');
    });
  });
});
