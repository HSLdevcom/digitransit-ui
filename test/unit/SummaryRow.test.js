import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mountWithIntl, shallowWithIntl } from './helpers/mock-intl-enzyme';
import {
  component as SummaryRow,
  ModeLeg,
  ViaLeg,
  RouteLeg,
} from '../../app/component/SummaryRow';

import dcw12 from './test-data/dcw12';
import dcw31 from './test-data/dcw31';
import { mockContext, mockChildContextTypes } from './helpers/mock-context';

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
      hash: 1,
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

  it('should display all city bike leg start stations in the summary view', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.cityBikeRouteWithIntermediatePlaces.data,
      hash: 1,
      intermediatePlaces:
        dcw12.cityBikeRouteWithIntermediatePlaces.intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime: dcw12.cityBikeRouteWithIntermediatePlaces.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(5);
    expect(legs.childAt(0).text()).to.contain('Velodrominrinne');
    expect(legs.childAt(2).text()).to.contain('Näkinsilta');
    expect(legs.childAt(4).text()).to.contain('Albertinkatu');
  });

  it('should hide short legs from the summary view for a non-transit itinerary', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.bikingRouteWithIntermediatePlaces.data,
      hash: 1,
      intermediatePlaces:
        dcw12.bikingRouteWithIntermediatePlaces.intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime: dcw12.bikingRouteWithIntermediatePlaces.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(6);
    expect(legs.childAt(0).is(ModeLeg)).to.equal(true);
    expect(legs.childAt(1).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(2).is(ModeLeg)).to.equal(true);
    expect(legs.childAt(3).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(4).is(ModeLeg)).to.equal(true);
    expect(legs.childAt(5).is(ModeLeg)).to.equal(true);
  });

  it('should ignore locationSlack when hiding short legs', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.shortRailRouteWithLongSlacktime.data,
      hash: 1,
      intermediatePlaces:
        dcw12.shortRailRouteWithLongSlacktime.intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime: dcw12.shortRailRouteWithLongSlacktime.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(4);
    expect(legs.childAt(1).is(RouteLeg)).to.equal(true);
    expect(legs.childAt(2).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(3).is(RouteLeg)).to.equal(true);
  });

  it('should show a connecting walk leg between via points for transit itinerary', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.transitRouteWithWalkConnectingIntermediatePlaces.data,
      hash: 1,
      intermediatePlaces:
        dcw12.transitRouteWithWalkConnectingIntermediatePlaces
          .intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime: dcw12.transitRouteWithWalkConnectingIntermediatePlaces.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(6);
    expect(legs.childAt(1).is(RouteLeg)).to.equal(true);
    expect(legs.childAt(2).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(3).is(ModeLeg)).to.equal(true);
    expect(legs.childAt(4).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(5).is(RouteLeg)).to.equal(true);
  });

  it('should show a connecting walk leg between last via point and end for transit itinerary', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace.data,
      hash: 1,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace
          .intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(4);
    expect(legs.childAt(1).is(RouteLeg)).to.equal(true);
    expect(legs.childAt(2).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(3).is(ModeLeg)).to.equal(true);
  });

  it('should show a connecting walk leg between start and first via point for transit itinerary', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace.data,
      hash: 1,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace
          .intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(4);
    expect(legs.childAt(1).is(ModeLeg)).to.equal(true);
    expect(legs.childAt(2).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(3).is(RouteLeg)).to.equal(true);
  });

  it('should show a via point for transit itinerary when the via point is at a stop', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.transitRouteWithIntermediatePlaceAtStop.data,
      hash: 1,
      intermediatePlaces:
        dcw12.transitRouteWithIntermediatePlaceAtStop.intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime: dcw12.transitRouteWithIntermediatePlaceAtStop.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(4);
    expect(legs.childAt(1).is(RouteLeg)).to.equal(true);
    expect(legs.childAt(2).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(3).is(RouteLeg)).to.equal(true);
  });

  it('should show the really short first walking leg for a transit itinerary', () => {
    const props = {
      breakpoint: 'large',
      data: dcw12.shortWalkingFirstLegWithMultipleViaPoints.data,
      hash: 1,
      intermediatePlaces:
        dcw12.shortWalkingFirstLegWithMultipleViaPoints.intermediatePlaces,
      onSelect: () => {},
      onSelectImmediately: () => {},
      passive: false,
      refTime: dcw12.shortWalkingFirstLegWithMultipleViaPoints.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(8);
    expect(legs.childAt(1).is(ModeLeg)).to.equal(true);
    expect(legs.childAt(2).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(3).is(RouteLeg)).to.equal(true);
    expect(legs.childAt(4).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(5).is(RouteLeg)).to.equal(true);
    expect(legs.childAt(6).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(7).is(ModeLeg)).to.equal(true);
  });
});
