import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import sinon from 'sinon';

import {
  component as Itinerary,
  ViaLeg,
} from '../../../../../app/component/itinerary/Itinerary';
import StreetBar from '../../../../../app/component/itinerary/StreetBar';
import TransitBar from '../../../../../app/component/itinerary/TransitBar';
import Feedback from '../../../../../app/component/itinerary/Feedback';
import RouteNumberContainer from '../../../../../app/component/RouteNumberContainer';
import {
  AlertSeverityLevelType,
  ExtendedRouteTypes,
} from '../../../../../app/constants';
import {
  mockChildContextTypes,
  mockContext,
} from '../../../helpers/mock-context';
import {
  mountWithIntl,
  shallowWithIntl,
} from '../../../helpers/mock-intl-enzyme';
import dcw12 from '../../../test-data/dcw12';

const defaultProps = {
  breakpoint: 'large',
  hash: 1,
  focusToHeader: () => {},
  refTime: 0,
};

describe('<Itinerary />', () => {
  it('should display both walking legs in the summary view', () => {
    const props = {
      ...defaultProps,
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      passive: false,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const wrapper = shallowWithIntl(<Itinerary {...props} />, {
      context: { config: mockContext.config },
    });

    expect(wrapper.find('.itinerary-legs').children()).to.have.lengthOf(3);
    expect(wrapper.find(StreetBar)).to.have.lengthOf(2);
    expect(wrapper.find(ViaLeg)).to.have.lengthOf(1);
  });

  it('should display all city bike leg start stations in the summary view', () => {
    const props = {
      ...defaultProps,
      itinerary: dcw12.cityBikeRouteWithIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.cityBikeRouteWithIntermediatePlaces.intermediatePlaces,
      passive: false,
      refTime: dcw12.cityBikeRouteWithIntermediatePlaces.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      config: {
        ...mockContext.config,
        vehicleRental: {
          ...mockContext.config.vehicleRental,
          fewAvailableCount: 3,
        },
      },
      childContextTypes: { ...mockChildContextTypes },
    });
    const legs = wrapper.find('.itinerary-legs');
    expect(legs.find(StreetBar)).to.have.lengthOf.above(3);
    expect(wrapper.find(ViaLeg)).to.have.lengthOf(2);
  });

  it('should hide short legs from the summary view for a non-transit itinerary', () => {
    const props = {
      ...defaultProps,
      itinerary: dcw12.bikingRouteWithIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.bikingRouteWithIntermediatePlaces.intermediatePlaces,
      passive: false,
      refTime: dcw12.bikingRouteWithIntermediatePlaces.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(5);
    expect(legs.childAt(0).is(StreetBar)).to.equal(true);
    expect(legs.childAt(1).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(2).is(StreetBar)).to.equal(true);
    expect(legs.childAt(3).is(ViaLeg)).to.equal(true);
    expect(legs.childAt(4).is(StreetBar)).to.equal(true);
  });

  it('should show a connecting walk leg between via points for transit itinerary', () => {
    const props = {
      ...defaultProps,
      itinerary: dcw12.transitRouteWithWalkConnectingIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.transitRouteWithWalkConnectingIntermediatePlaces
          .intermediatePlaces,
      passive: false,
      refTime: dcw12.transitRouteWithWalkConnectingIntermediatePlaces.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find(ViaLeg)).to.have.lengthOf(2);
    expect(wrapper.find(TransitBar)).to.have.lengthOf(2);
    expect(wrapper.find(StreetBar)).to.have.lengthOf.above(0);
  });

  it('should show a connecting walk leg between last via point and end for transit itinerary', () => {
    const props = {
      ...defaultProps,
      itinerary:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace.data,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace
          .intermediatePlaces,
      passive: false,
      refTime:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(4);
    expect(legs.childAt(0).is(TransitBar)).to.equal(true);
    expect(legs.childAt(legs.length).is(StreetBar)).to.equal(true);
  });

  it('should show a connecting walk leg between start and first via point for transit itinerary', () => {
    const props = {
      ...defaultProps,
      itinerary:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace.data,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace
          .intermediatePlaces,
      passive: false,
      refTime:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    const legs = wrapper.find('.itinerary-legs');
    expect(legs.children()).to.have.lengthOf(4);
    expect(legs.childAt(0).is(StreetBar)).to.equal(true);
    expect(legs.childAt(1).is(ViaLeg)).to.equal(true);
  });

  it('should show a via point for transit itinerary when the via point is at a stop', () => {
    const props = {
      ...defaultProps,
      itinerary: dcw12.transitRouteWithIntermediatePlaceAtStop.data,
      intermediatePlaces:
        dcw12.transitRouteWithIntermediatePlaceAtStop.intermediatePlaces,
      passive: false,
      refTime: dcw12.transitRouteWithIntermediatePlaceAtStop.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find(ViaLeg)).to.have.lengthOf(1);
  });

  it('should show the really short first walking leg for a transit itinerary', () => {
    const props = {
      ...defaultProps,
      itinerary: dcw12.shortWalkingFirstLegWithMultipleViaPoints.data,
      intermediatePlaces:
        dcw12.shortWalkingFirstLegWithMultipleViaPoints.intermediatePlaces,
      passive: false,
      refTime: dcw12.shortWalkingFirstLegWithMultipleViaPoints.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });

    expect(wrapper.find(ViaLeg)).to.have.lengthOf(3);
    expect(wrapper.find(TransitBar)).to.have.lengthOf(2);
    expect(wrapper.find(StreetBar)).to.have.lengthOf.above(2);
  });

  it('should not indicate that there is a disruption if the alert is not in effect', () => {
    const alertEffectiveEndDate = 1553778000;
    const props = {
      ...defaultProps,
      itinerary: {
        start: new Date((alertEffectiveEndDate + 1) * 1000).toISOString(),
        end: new Date((alertEffectiveEndDate + 100) * 1000).toISOString(),
        legs: [
          {
            from: {},
            to: {},
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
            start: {
              scheduledTime: new Date(
                (alertEffectiveEndDate + 1) * 1000,
              ).toISOString(),
            },
            end: {
              scheduledTime: new Date(
                (alertEffectiveEndDate + 100) * 1000,
              ).toISOString(),
            },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
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
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769601000).toISOString(),
        legs: [
          {
            from: {},
            to: {},
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
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769601000).toISOString() },
            trip: {
              pattern: {
                code: 'HSL:3001I:0:01',
              },
            },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
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
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769601000).toISOString(),
        legs: [
          {
            from: {},
            to: {},
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
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769601000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
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
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769601000).toISOString(),
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
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769601000).toISOString() },
            to: {},
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
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
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769601000).toISOString(),
        legs: [
          {
            from: {},
            mode: 'RAIL',
            route: {
              alerts: [],
              mode: 'RAIL',
            },
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769601000).toISOString() },
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
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(AlertSeverityLevelType.Warning);
  });

  it('should not indicate that there is a disruption due to a stop alert at an intermediate stop', () => {
    const props = {
      ...defaultProps,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769601000).toISOString(),
        legs: [
          {
            from: {},
            to: {},
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
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769601000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(
      wrapper.find(RouteNumberContainer).props().alertSeverityLevel,
    ).to.equal(undefined);
  });

  it('should render a CAR leg with the car icon and a park-and-ride indicator', () => {
    const props = {
      ...defaultProps,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769700000).toISOString(),
        legs: [
          {
            from: {},
            to: { vehicleParking: true },
            mode: 'CAR',
            duration: 600,
            distance: 3000,
            route: null,
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769660000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    const streetBar = wrapper.find(StreetBar);
    expect(streetBar).to.have.lengthOf(1);
    expect(streetBar.props().mode).to.equal('CAR');
    expect(streetBar.props().icon).to.equal('icon_car');
    expect(wrapper.find('.leg.car_park')).to.have.lengthOf(1);
  });

  it('should render a taxi leg with the external taxi icon and skip the transit bar even when a route is present', () => {
    const props = {
      ...defaultProps,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769700000).toISOString(),
        legs: [
          {
            from: {},
            to: {},
            mode: 'TAXI',
            duration: 500,
            distance: 2000,
            route: { mode: 'BUS', alerts: [] },
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769660000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find(TransitBar)).to.have.lengthOf(0);
    const streetBar = wrapper.find(StreetBar);
    expect(streetBar).to.have.lengthOf(1);
    expect(streetBar.props().mode).to.equal('taxi-external');
    expect(streetBar.props().icon).to.equal(
      mockContext.config.flex.taxiExternalIcon,
    );
  });

  it('should render a scooter leg and suppress the CO2 summary even when emissions data is present', () => {
    const props = {
      ...defaultProps,
      lowestCo2value: 40,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769700000).toISOString(),
        emissionsPerPerson: { co2: 40 },
        legs: [
          {
            from: {},
            to: {},
            mode: 'SCOOTER',
            rentedBike: true,
            duration: 400,
            distance: 1800,
            route: null,
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769660000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      config: { ...mockContext.config, showCO2InItinerarySummary: true },
      childContextTypes: { ...mockChildContextTypes },
    });
    const streetBar = wrapper.find(StreetBar);
    expect(streetBar).to.have.lengthOf(1);
    expect(streetBar.props().mode).to.equal('SCOOTER');
    expect(wrapper.find('.itinerary-co2-value-container')).to.have.lengthOf(0);
  });

  it('should show the CO2 leaf icon and total distance when configured and the itinerary has the lowest emissions', () => {
    const props = {
      ...defaultProps,
      lowestCo2value: 42,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769700000).toISOString(),
        emissionsPerPerson: { co2: 42 },
        legs: [
          {
            from: {},
            to: {},
            mode: 'RAIL',
            route: { alerts: [], mode: 'RAIL' },
            distance: 1500,
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769660000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      config: {
        ...mockContext.config,
        showCO2InItinerarySummary: true,
        showDistanceInItinerarySummary: true,
      },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find('svg.co2-leaf')).to.have.lengthOf(1);
    expect(wrapper.find('.itinerary-co2-value').text()).to.equal('42 g');
    expect(wrapper.find('.itinerary-total-distance').text()).to.equal('1.5 km');
  });

  it('should show a short citybike duration warning when a single rental network exceeds its surcharge-free time', () => {
    const props = {
      ...defaultProps,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553770500000).toISOString(),
        legs: [
          {
            from: {
              vehicleRentalStation: {
                rentalNetwork: { networkId: 'testnetwork' },
              },
            },
            to: {},
            mode: 'CITYBIKE',
            rentedBike: true,
            duration: 900,
            distance: 3000,
            route: null,
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553770500000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      config: {
        ...mockContext.config,
        vehicleRental: {
          ...mockContext.config.vehicleRental,
          networks: {
            testnetwork: {
              timeBeforeSurcharge: 600,
              durationInstructions: 'https://example.org/pricing',
              icon: 'citybike',
            },
          },
        },
      },
      childContextTypes: { ...mockChildContextTypes },
    });
    const warning = wrapper.find('.citybike-duration-info-short');
    expect(warning).to.have.lengthOf(1);
    expect(warning.text()).to.contain('10 min');
  });

  it('should show the general citybike duration warning when more than one rental network exceeds its surcharge-free time', () => {
    const props = {
      ...defaultProps,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553771400000).toISOString(),
        legs: [
          {
            from: {
              vehicleRentalStation: {
                rentalNetwork: { networkId: 'networka' },
              },
            },
            to: {},
            mode: 'CITYBIKE',
            rentedBike: true,
            duration: 900,
            distance: 3000,
            route: null,
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553770500000).toISOString() },
          },
          {
            from: {
              vehicleRentalStation: {
                rentalNetwork: { networkId: 'networkb' },
              },
            },
            to: {},
            mode: 'CITYBIKE',
            rentedBike: true,
            duration: 900,
            distance: 3000,
            route: null,
            start: { scheduledTime: new Date(1553770500000).toISOString() },
            end: { scheduledTime: new Date(1553771400000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      config: {
        ...mockContext.config,
        vehicleRental: {
          ...mockContext.config.vehicleRental,
          networks: {
            networka: {
              timeBeforeSurcharge: 600,
              durationInstructions: 'https://example.org/pricing',
            },
            networkb: {
              timeBeforeSurcharge: 600,
              durationInstructions: 'https://example.org/pricing',
            },
          },
        },
      },
      childContextTypes: { ...mockChildContextTypes },
    });
    const warning = wrapper.find('.citybike-duration-info-short');
    expect(warning).to.have.lengthOf(1);
    expect(warning.text()).to.contain(
      'Extra charge applies to several sections',
    );
  });

  it('should render the Feedback component when feedback is requested for a recommended itinerary', () => {
    const props = {
      ...defaultProps,
      giveFeedback: () => {},
      recommended: true,
      feedback: true,
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find(Feedback)).to.have.lengthOf(1);
  });

  it('should not render the Feedback component when feedback props are absent', () => {
    const props = {
      ...defaultProps,
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find(Feedback)).to.have.lengthOf(0);
  });

  it('should show an estimated time and dial-a-ride message for a call agency leg', () => {
    const props = {
      ...defaultProps,
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553769660000).toISOString(),
        legs: [
          {
            from: {},
            to: {},
            mode: 'BUS',
            route: {
              alerts: [],
              mode: 'BUS',
              type: ExtendedRouteTypes.CallAgency,
              agency: { gtfsId: 'test:agency' },
            },
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553769660000).toISOString() },
          },
        ],
      },
    };
    const wrapper = mountWithIntl(<Itinerary {...props} />, {
      context: { ...mockContext },
      childContextTypes: { ...mockChildContextTypes },
    });
    expect(wrapper.find('.itinerary-duration').text()).to.contain('Estimate');
    expect(wrapper.text()).to.contain('Dial-a-ride service');
  });

  describe('selecting an itinerary', () => {
    const buildProps = extra => ({
      ...defaultProps,
      hash: 2,
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
      ...extra,
    });

    it('should immediately navigate to the itinerary details when not passive', () => {
      const replace = sinon.spy();
      const push = sinon.spy();
      const focusToHeader = sinon.spy();
      const props = buildProps({ passive: false, focusToHeader });
      const wrapper = mountWithIntl(<Itinerary {...props} />, {
        context: { ...mockContext },
        router: { ...mockContext.router, replace, push },
        childContextTypes: { ...mockChildContextTypes },
      });
      wrapper.find('.summary-clickable-area').first().simulate('click');
      expect(replace.calledOnce).to.equal(true);
      expect(push.calledOnce).to.equal(true);
      expect(focusToHeader.calledOnce).to.equal(true);
    });

    it('should only highlight the itinerary without navigating when passive on a large breakpoint', () => {
      const replace = sinon.spy();
      const push = sinon.spy();
      const focusToHeader = sinon.spy();
      const props = buildProps({
        passive: true,
        breakpoint: 'large',
        focusToHeader,
      });
      const wrapper = mountWithIntl(<Itinerary {...props} />, {
        context: { ...mockContext },
        router: { ...mockContext.router, replace, push },
        childContextTypes: { ...mockChildContextTypes },
      });
      wrapper.find('.summary-clickable-area').first().simulate('click');
      expect(push.called).to.equal(false);
      expect(replace.calledOnce).to.equal(true);
      expect(replace.firstCall.args[0].state.selectedItineraryIndex).to.equal(
        2,
      );
      expect(focusToHeader.called).to.equal(false);
    });

    it('should still navigate immediately on a mobile breakpoint even when passive', () => {
      const replace = sinon.spy();
      const push = sinon.spy();
      const focusToHeader = sinon.spy();
      const props = buildProps({
        passive: true,
        breakpoint: 'small',
        focusToHeader,
      });
      const wrapper = mountWithIntl(<Itinerary {...props} />, {
        context: { ...mockContext },
        router: { ...mockContext.router, replace, push },
        childContextTypes: { ...mockChildContextTypes },
      });
      wrapper.find('.summary-clickable-area').first().simulate('click');
      expect(push.calledOnce).to.equal(true);
      expect(focusToHeader.calledOnce).to.equal(true);
    });
  });
});
