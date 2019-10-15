import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext, mockChildContextTypes } from '../helpers/mock-context';
import { mountWithIntl, shallowWithIntl } from '../helpers/mock-intl-enzyme';
import {
  component as SummaryRow,
  ModeLeg,
  ViaLeg,
  RouteLeg,
} from '../../../app/component/SummaryRow';
import { AlertSeverityLevelType } from '../../../app/constants';
import RouteNumberContainer from '../../../app/component/RouteNumberContainer';

import dcw12 from '../test-data/dcw12';
import dcw31 from '../test-data/dcw31';
import dt2830 from '../test-data/dt2830';

const defaultProps = {
  breakpoint: 'large',
  hash: 1,
  onSelect: () => {},
  onSelectImmediately: () => {},
  refTime: 0,
};

describe('<SummaryRow />', () => {
  it('should not show walking distance in desktop view for biking-only itineraries', () => {
    const props = {
      ...defaultProps,
      data: dcw31.onlyBiking,
      refTime: dcw31.onlyBiking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(wrapper.find('.itinerary-walking-distance')).to.have.lengthOf(0);
  });

  it('should not show walking distance in mobile view for biking-only itineraries', () => {
    const props = {
      ...defaultProps,
      breakpoint: 'small',
      data: dcw31.onlyBiking,
      refTime: dcw31.onlyBiking.startTime,
    };
    const wrapper = shallowWithIntl(<SummaryRow {...props} />, {
      context: { config: {} },
    });
    expect(wrapper.find('.itinerary-walking-distance')).to.have.lengthOf(0);
  });

  it('should show biking distance before walking distance in desktop view', () => {
    const props = {
      ...defaultProps,
      data: dcw31.bikingAndWalking,
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
      ...defaultProps,
      breakpoint: 'small',
      data: dcw31.onlyBiking,
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
      ...defaultProps,
      data: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
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
      ...defaultProps,
      data: dcw12.cityBikeRouteWithIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.cityBikeRouteWithIntermediatePlaces.intermediatePlaces,
      passive: false,
      refTime: dcw12.cityBikeRouteWithIntermediatePlaces.refTime,
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: {
        ...mockContext,
        config: { cityBike: { fewAvailableCount: 3 } },
      },
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
      ...defaultProps,
      data: dcw12.bikingRouteWithIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.bikingRouteWithIntermediatePlaces.intermediatePlaces,
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
      ...defaultProps,
      data: dcw12.shortRailRouteWithLongSlacktime.data,
      intermediatePlaces:
        dcw12.shortRailRouteWithLongSlacktime.intermediatePlaces,
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
      ...defaultProps,
      data: dcw12.transitRouteWithWalkConnectingIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.transitRouteWithWalkConnectingIntermediatePlaces
          .intermediatePlaces,
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
      ...defaultProps,
      data: dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace.data,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace
          .intermediatePlaces,
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
      ...defaultProps,
      data: dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace.data,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace
          .intermediatePlaces,
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
      ...defaultProps,
      data: dcw12.transitRouteWithIntermediatePlaceAtStop.data,
      intermediatePlaces:
        dcw12.transitRouteWithIntermediatePlaceAtStop.intermediatePlaces,
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
      ...defaultProps,
      data: dcw12.shortWalkingFirstLegWithMultipleViaPoints.data,
      intermediatePlaces:
        dcw12.shortWalkingFirstLegWithMultipleViaPoints.intermediatePlaces,
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

  it('should indicate which itineraries are canceled', () => {
    const props = {
      ...defaultProps,
      data: dt2830,
      passive: false,
      refTime: 1551272073000,
      zones: [],
      isCancelled: true,
      showCancelled: true,
    };

    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find('.cancelled-itinerary')).to.have.lengthOf(1);
  });

  it('should not indicate that there is a disruption if the route has an alert for another trip', () => {
    const props = {
      ...defaultProps,
      data: {
        legs: [
          {
            from: {},
            mode: 'RAIL',
            route: {
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                  effectiveEndDate: 1553778000,
                  effectiveStartDate: 1553754595,
                  trip: {
                    pattern: {
                      code: 'HSL:3001I:0:02',
                    },
                  },
                },
              ],
              mode: 'RAIL',
            },
            startTime: 1553769600000,
            trip: {
              pattern: {
                code: 'HSL:3001I:0:01',
              },
            },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(undefined);
  });

  it('should not indicate that there is a disruption if the alert is not in effect', () => {
    const alertEffectiveEndDate = 1553778000;
    const props = {
      ...defaultProps,
      data: {
        legs: [
          {
            from: {},
            mode: 'RAIL',
            route: {
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                  effectiveEndDate: alertEffectiveEndDate,
                  effectiveStartDate: 1553754595,
                },
              ],
              mode: 'RAIL',
            },
            startTime: (alertEffectiveEndDate + 1) * 1000, // * 1000 due to ms format
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(undefined);
  });

  it('should indicate that there is a disruption due to a trip alert', () => {
    const props = {
      ...defaultProps,
      data: {
        legs: [
          {
            from: {},
            mode: 'RAIL',
            route: {
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                  effectiveEndDate: 1553778000,
                  effectiveStartDate: 1553754595,
                  trip: {
                    pattern: {
                      code: 'HSL:3001I:0:01',
                    },
                  },
                },
              ],
              mode: 'RAIL',
            },
            startTime: 1553769600000,
            trip: {
              pattern: {
                code: 'HSL:3001I:0:01',
              },
            },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(AlertSeverityLevelType.Warning);
  });

  it('should indicate that there is a disruption due to a route alert', () => {
    const props = {
      ...defaultProps,
      data: {
        legs: [
          {
            from: {},
            mode: 'RAIL',
            route: {
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                  effectiveEndDate: 1553778000,
                  effectiveStartDate: 1553754595,
                  trip: null,
                },
              ],
              mode: 'RAIL',
            },
            startTime: 1553769600000,
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(AlertSeverityLevelType.Warning);
  });

  it('should indicate that there is a disruption due to a stop alert at the "from" stop', () => {
    const props = {
      ...defaultProps,
      data: {
        legs: [
          {
            from: {
              stop: {
                alerts: [
                  {
                    alertSeverityLevel: AlertSeverityLevelType.Warning,
                    effectiveEndDate: 1553778000,
                    effectiveStartDate: 1553754595,
                  },
                ],
              },
            },
            mode: 'RAIL',
            route: {
              alerts: [],
              mode: 'RAIL',
            },
            startTime: 1553769600000,
            to: {},
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(AlertSeverityLevelType.Warning);
  });

  it('should indicate that there is a disruption due to a stop alert at the "to" stop', () => {
    const props = {
      ...defaultProps,
      data: {
        legs: [
          {
            from: {},
            mode: 'RAIL',
            route: {
              alerts: [],
              mode: 'RAIL',
            },
            startTime: 1553769600000,
            to: {
              stop: {
                alerts: [
                  {
                    alertSeverityLevel: AlertSeverityLevelType.Warning,
                    effectiveEndDate: 1553778000,
                    effectiveStartDate: 1553754595,
                  },
                ],
              },
            },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(AlertSeverityLevelType.Warning);
  });

  it('should indicate that there is a disruption due to a stop alert at an intermediate stop', () => {
    const props = {
      ...defaultProps,
      data: {
        legs: [
          {
            from: {},
            intermediatePlaces: [
              {
                stop: {
                  alerts: [],
                },
              },
              {
                stop: {
                  alerts: [
                    {
                      alertSeverityLevel: AlertSeverityLevelType.Warning,
                      effectiveEndDate: 1553778000,
                      effectiveStartDate: 1553754595,
                    },
                  ],
                },
              },
              {
                stop: {},
              },
            ],
            mode: 'RAIL',
            route: {
              alerts: [],
              mode: 'RAIL',
            },
            startTime: 1553769600000,
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<SummaryRow {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(AlertSeverityLevelType.Warning);
  });
});
