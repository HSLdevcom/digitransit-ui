import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import data from './test-data/dcw31';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import ItinerarySummary from '../../app/component/ItinerarySummary';
import WalkDistance from '../../app/component/WalkDistance';
import { mockContext, mockChildContextTypes } from './helpers/mock-context';

describe('<ItinerarySummary />', () => {
  it('should show biking distance and walking distance', () => {
    const props = {
      children: <div />,
      itinerary: data.bikingAndWalking,
    };
    const wrapper = mountWithIntl(<ItinerarySummary {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    });
    expect(wrapper.find(WalkDistance).length).to.equal(2);
  });

  it('should show biking distance before walking distance', () => {
    const props = {
      children: <div />,
      itinerary: data.bikingAndWalking,
    };
    const wrapper = mountWithIntl(<ItinerarySummary {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    }).find('.itinerary-summary');
    expect(wrapper.childAt(1).prop('className')).to.equal(
      'distance--itinerary-summary',
    );
    expect(wrapper.childAt(2).is(WalkDistance)).to.equal(true);
  });

  it('should show only biking distance for only biking itinerary', () => {
    const props = {
      children: <div />,
      itinerary: data.onlyBiking,
    };
    const wrapper = mountWithIntl(<ItinerarySummary {...props} />, {
      context: mockContext,
      childContextTypes: mockChildContextTypes,
    }).find(WalkDistance);
    expect(wrapper.length).to.equal(1);
    expect(wrapper.is('.distance--itinerary-summary')).to.equal(true);
  });
});
