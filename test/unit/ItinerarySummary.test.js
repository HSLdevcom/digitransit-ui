import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import data from './test-data/dcw31';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import ItinerarySummary from '../../app/component/itinerary/ItinerarySummary';
import Distance from '../../app/component/itinerary/Distance';
import { mockContext, mockChildContextTypes } from './helpers/mock-context';

describe('<ItinerarySummary />', () => {
  it('should show biking distance and walking distance', () => {
    const props = {
      children: <div />,
      itinerary: data.bikingAndWalking,
      biking: {
        distance: 1000,
        duration: 180,
      },
      walking: {
        distance: 555,
        duration: 300,
      },
    };
    const wrapper = mountWithIntl(<ItinerarySummary {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    });
    expect(wrapper.find(Distance).length).to.equal(2);
  });

  it('should show walking distance before biking distance', () => {
    const props = {
      children: <div />,
      itinerary: data.bikingAndWalking,
      biking: {
        distance: 1000,
        duration: 180,
      },
      walking: {
        distance: 555,
        duration: 300,
      },
    };
    const wrapper = mountWithIntl(<ItinerarySummary {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    }).find('.distance--itinerary-summary');
    expect(wrapper.first().find('.icon.walk').length).to.equal(1);
    expect(wrapper.last().find('.icon.bike').length).to.equal(1);
  });

  it('should show only biking distance for only biking itinerary', () => {
    const props = {
      children: <div />,
      itinerary: data.onlyBiking,
      biking: {
        distance: 1000,
        duration: 180,
      },
    };
    const wrapper = mountWithIntl(<ItinerarySummary {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    });
    expect(wrapper.find(Distance).length).to.equal(1);
    expect(wrapper.find('.icon.bike').length).to.equal(1);
    expect(wrapper.find('.icon.walk').length).to.equal(0);
  });
});
