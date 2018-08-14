import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import {
  component as SummaryRow,
  ModeLeg,
  ViaLeg,
} from '../../app/component/SummaryRow';

import dcw12 from './test-data/dcw12';
import dcw31 from './test-data/dcw31';

describe('<SummaryRow />', () => {
  it('should not show walking distance in desktop view for biking-only itineraries', () => {
    const props = {
      breakpoint: 'large',
      data: dcw31.onlyBiking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: dcw31.onlyBiking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(wrapper.find('.itinerary-walking-distance')).to.have.lengthOf(0);
  });

  it('should not show walking distance in mobile view for biking-only itineraries', () => {
    const props = {
      breakpoint: 'small',
      data: dcw31.onlyBiking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: dcw31.onlyBiking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(wrapper.find('.itinerary-walking-distance')).to.have.lengthOf(0);
  });

  it('should show biking distance before walking distance in desktop view', () => {
    const props = {
      breakpoint: 'large',
      data: dcw31.bikingAndWalking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: dcw31.bikingAndWalking.startTime,
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
      data: dcw31.onlyBiking,
      hash: 1,
      onSelect: () => {},
      onSelectImmediately: () => {},
      refTime: dcw31.onlyBiking.startTime,
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

  it('should display both walking legs in the summary view', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });

    expect(wrapper.find('.itinerary-legs').children()).to.have.lengthOf(3);
    expect(wrapper.find(ModeLeg)).to.have.lengthOf(2);
    expect(wrapper.find(ViaLeg)).to.have.lengthOf(1);
  });
});
