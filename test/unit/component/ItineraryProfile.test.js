import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

import ItineraryProfile from '../../../app/component/ItineraryProfile';

describe('<ItineraryProfile />', () => {
  it('should only render total distance information for non-biking itineraries', () => {
    const props = {
      itinerary: {
        legs: [
          {
            distance: 1200,
            mode: 'BUS',
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<ItineraryProfile {...props} />, {
      context: { config: { imperialEnabled: false } },
    });

    expect(wrapper.find('.itinerary-profile-item')).to.have.lengthOf(1);
    expect(wrapper.find('.itinerary-profile-item-value').at(0).text()).to.equal(
      '1.2 km',
    );
  });
});
