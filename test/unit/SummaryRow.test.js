import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import data from './test-data/dcw31';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import { component as SummaryRow } from '../../app/component/SummaryRow';

describe('<SummaryRow />', () => {
  it('should not show walking distance in desktop view for biking-only itineraries', () => {
    const props = {
      breakpoint: 'large',
      data: data.onlyBiking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: data.onlyBiking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(wrapper.find('.itinerary-walking-distance')).to.have.lengthOf(0);
  });

  it('should not show walking distance in mobile view for biking-only itineraries', () => {
    const props = {
      breakpoint: 'small',
      data: data.onlyBiking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: data.onlyBiking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(wrapper.find('.itinerary-walking-distance')).to.have.lengthOf(0);
  });

  it('should show biking distance before walking distance in desktop view', () => {
    const props = {
      breakpoint: 'large',
      data: data.bikingBeforeWalking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: data.bikingBeforeWalking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(
      wrapper
        .find('.itinerary-duration-and-distance')
        .childAt(1)
        .prop('className'),
    ).to.equal('itinerary-biking-distance');
    expect(
      wrapper
        .find('.itinerary-duration-and-distance')
        .childAt(2)
        .prop('className'),
    ).to.equal('itinerary-walking-distance');
  });

  it('should show biking distance instead of walking distance in mobile view for biking-only itineraries', () => {
    const props = {
      breakpoint: 'small',
      data: data.onlyBiking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: data.onlyBiking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(
      wrapper.find(
        '.itinerary-duration-and-distance > .itinerary-biking-distance',
      ),
    ).to.have.lengthOf(1);
  });
});
