import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import { mockContext } from './helpers/mock-context';

import { Component as ItineraryDetailView } from '../../app/component/ItineraryDetailView';
import dt2831 from './test-data/dt2831';

describe('<ItineraryDetailView />', () => {
  it('should render the container div', () => {
    const props = {
      itinerary: dt2831,
      focusToPoint: () => {},
      focusToLeg: () => {},
      showCanceledLegsBanner: false,
      plan: {
        date: 19700101,
      },
      isMobile: false,
      currentTime: 0,
      lang: 'fi',
    };
    const wrapper = shallowWithIntl(<ItineraryDetailView {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.itinerary-tab').length).to.equal(1);
  });
});
