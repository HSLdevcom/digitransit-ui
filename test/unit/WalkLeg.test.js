import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import WalkLeg from '../../app/component/WalkLeg';

describe('<WalkLeg />', () => {
  it('should show the leg starting point name', () => {
    const props = {
      focusAction: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        startTime: 1529589709000,
      },
    };

    const wrapper = mountWithIntl(<WalkLeg {...props} />, {
      context: {
        ...mockContext,
        config: {},
      },
      childContextTypes: mockChildContextTypes,
    });

    expect(wrapper.find('.itinerary-leg-first-row>div').text()).to.equal(
      'Veturitori',
    );
  });

  it('should tell the user to return a rented bike to the starting point station', () => {
    const props = {
      focusAction: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        startTime: 1529589709000,
      },
      previousLeg: {
        distance: 3297.017000000001,
        duration: 904,
        from: {
          name: 'Kaisaniemenpuisto',
          stop: null,
        },
        mode: 'BICYCLE',
        rentedBike: true,
        startTime: 1529588805000,
      },
    };

    const wrapper = mountWithIntl(<WalkLeg {...props} />, {
      context: {
        ...mockContext,
        config: {},
      },
      childContextTypes: mockChildContextTypes,
    });

    expect(wrapper.find('.itinerary-leg-first-row>div').text()).to.equal(
      'Return the bike to Veturitori station',
    );
  });
});
