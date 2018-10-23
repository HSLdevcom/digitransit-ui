import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

import ItineraryProfile from '../../../app/component/ItineraryProfile';

describe('<ItineraryProfile />', () => {
  it('should render elevation information if the itinerary contains biking', () => {
    const props = {
      itinerary: {
        elevationGained: 10,
        elevationLost: 20,
        legs: [
          {
            distance: 100,
            mode: 'WALK',
          },
          {
            distance: 200,
            mode: 'BICYCLE',
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<ItineraryProfile {...props} />, {
      context: { config: { imperialEnabled: false } },
    });

    expect(wrapper.find('.itinerary-profile-item')).to.have.lengthOf(3);
    expect(
      wrapper
        .find('.itinerary-profile-item-value')
        .at(0)
        .text(),
    ).to.equal('10 m');
    expect(
      wrapper
        .find('.itinerary-profile-item-value')
        .at(1)
        .text(),
    ).to.equal('20 m');
    expect(
      wrapper
        .find('.itinerary-profile-item-value')
        .at(2)
        .text(),
    ).to.equal('300 m');
  });

  it('should only render total distance information for non-biking itineraries', () => {
    const props = {
      itinerary: {
        elevationGained: 100,
        elevationLost: 200,
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
    expect(
      wrapper
        .find('.itinerary-profile-item-value')
        .at(0)
        .text(),
    ).to.equal('1.2 km');
  });

  it('should display elevation information if it is in number format', () => {
    const props = {
      itinerary: {
        elevationGained: NaN,
        elevationLost: undefined,
        legs: [
          {
            distance: 200,
            mode: 'BICYCLE',
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<ItineraryProfile {...props} />, {
      context: { config: { imperialEnabled: false } },
    });

    expect(wrapper.find('.itinerary-profile-item')).to.have.lengthOf(1);
    expect(
      wrapper
        .find('.itinerary-profile-item-value')
        .at(0)
        .text(),
    ).to.equal('200 m');
  });
});
