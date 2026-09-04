import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import Profile from '../../../app/component/itinerary/Profile';

describe('<Profile />', () => {
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
    const { container } = renderWithProviders(<Profile {...props} />, {
      config: { CONFIG: 'hsl', URL: {}, imperialEnabled: false },
    });

    expect(
      container.querySelectorAll('.itinerary-profile-item'),
    ).to.have.lengthOf(1);
    expect(
      container.querySelector('.itinerary-profile-item-value').textContent,
    ).to.equal('1.2 km');
  });
});
