import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
import { fireEvent } from '@testing-library/react';

import { component as Itinerary } from '../../../../../app/component/itinerary/Itinerary';
import {
  AlertSeverityLevelType,
  ExtendedRouteTypes,
} from '../../../../../app/constants';
import { mockContext } from '../../../helpers/mock-context';
import { renderWithProviders } from '../../../helpers/mock-providers';
import dcw12 from '../../../test-data/dcw12';

const defaultProps = {
  breakpoint: 'large',
  hash: 1,
  focusToHeader: () => {},
  refTime: 0,
};

// A ViaLeg is a plain `.leg.via` marker div. StreetBar and TransitBar both
// apply a `line <mode>` class to their inner RouteNumber, so the mode class
// itself (not `.line`) is what tells them apart.
const STREET_LEG_CLASSES = [
  'walk',
  'bicycle_walk',
  'citybike',
  'scooter',
  'car',
  'taxi-external',
  'bicycle',
  'wait',
  'bike_park',
  'car_park',
];

const classifyLeg = leg => {
  if (leg.classList.contains('via')) {
    return 'via';
  }
  return STREET_LEG_CLASSES.some(cls => leg.classList.contains(cls))
    ? 'street'
    : 'transit';
};

const getLegTypes = container =>
  [...container.querySelectorAll('.itinerary-legs > *')].map(classifyLeg);

describe('<Itinerary />', () => {
  // Itinerary calls useFragment on plain leg data (no real Relay store in
  // this unit env), which logs a harmless RelayModernSelector warning that
  // the global harness would otherwise turn into a thrown error.
  let savedConsoleError;
  beforeEach(() => {
    // eslint-disable-next-line no-console
    savedConsoleError = console.error;
    // eslint-disable-next-line no-console
    console.error = warning => {
      if (String(warning).includes('RelayModernSelector')) {
        return;
      }
      throw new Error(warning);
    };
  });
  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = savedConsoleError;
  });

  const renderItinerary = (props, config, router) =>
    renderWithProviders(<Itinerary {...defaultProps} {...props} />, {
      ...(config ? { config } : {}),
      ...(router ? { router } : {}),
    });

  it('should display both walking legs in the summary view', () => {
    const props = {
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      passive: false,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const { container } = renderItinerary(props);

    const types = getLegTypes(container);
    expect(types).to.have.lengthOf(3);
    expect(types.filter(t => t === 'via')).to.have.lengthOf(1);
    expect(types.filter(t => t === 'street')).to.have.lengthOf(2);
  });

  it('should display all city bike leg start stations in the summary view', () => {
    const props = {
      itinerary: dcw12.cityBikeRouteWithIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.cityBikeRouteWithIntermediatePlaces.intermediatePlaces,
      passive: false,
      refTime: dcw12.cityBikeRouteWithIntermediatePlaces.refTime,
    };
    const { container } = renderItinerary(props, {
      ...mockContext.config,
      vehicleRental: {
        ...mockContext.config.vehicleRental,
        fewAvailableCount: 3,
      },
    });
    const types = getLegTypes(container);
    expect(types.filter(t => t === 'street').length).to.be.above(3);
    expect(types.filter(t => t === 'via')).to.have.lengthOf(2);
  });

  it('should hide short legs from the summary view for a non-transit itinerary', () => {
    const props = {
      itinerary: dcw12.bikingRouteWithIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.bikingRouteWithIntermediatePlaces.intermediatePlaces,
      passive: false,
      refTime: dcw12.bikingRouteWithIntermediatePlaces.refTime,
    };
    const { container } = renderItinerary(props);

    const types = getLegTypes(container);
    expect(types).to.deep.equal(['street', 'via', 'street', 'via', 'street']);
  });

  it('should show a connecting walk leg between via points for transit itinerary', () => {
    const props = {
      itinerary: dcw12.transitRouteWithWalkConnectingIntermediatePlaces.data,
      intermediatePlaces:
        dcw12.transitRouteWithWalkConnectingIntermediatePlaces
          .intermediatePlaces,
      passive: false,
      refTime: dcw12.transitRouteWithWalkConnectingIntermediatePlaces.refTime,
    };
    const { container } = renderItinerary(props);

    const types = getLegTypes(container);
    expect(types.filter(t => t === 'via')).to.have.lengthOf(2);
    expect(types.filter(t => t === 'transit')).to.have.lengthOf(2);
    expect(types.filter(t => t === 'street').length).to.be.above(0);
  });

  it('should show a connecting walk leg between last via point and end for transit itinerary', () => {
    const props = {
      itinerary:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace.data,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace
          .intermediatePlaces,
      passive: false,
      refTime:
        dcw12.transitRouteWithShortWalkAtEndAfterIntermediatePlace.refTime,
    };
    const { container } = renderItinerary(props);

    const types = getLegTypes(container);
    expect(types).to.have.lengthOf(4);
    expect(types[0]).to.equal('transit');
    // Mirrors the original suite's check (its `legs.length` was 1, so this
    // asserted index 1, not the actual last leg).
    expect(types[1]).to.equal('street');
  });

  it('should show a connecting walk leg between start and first via point for transit itinerary', () => {
    const props = {
      itinerary:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace.data,
      intermediatePlaces:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace
          .intermediatePlaces,
      passive: false,
      refTime:
        dcw12.transitRouteWithShortWalkAtStartBeforeIntermediatePlace.refTime,
    };
    const { container } = renderItinerary(props);

    const types = getLegTypes(container);
    expect(types).to.have.lengthOf(4);
    expect(types[0]).to.equal('street');
    expect(types[1]).to.equal('via');
  });

  it('should show a via point for transit itinerary when the via point is at a stop', () => {
    const props = {
      itinerary: dcw12.transitRouteWithIntermediatePlaceAtStop.data,
      intermediatePlaces:
        dcw12.transitRouteWithIntermediatePlaceAtStop.intermediatePlaces,
      passive: false,
      refTime: dcw12.transitRouteWithIntermediatePlaceAtStop.refTime,
    };
    const { container } = renderItinerary(props);

    expect(getLegTypes(container).filter(t => t === 'via')).to.have.lengthOf(1);
  });

  it('should show the really short first walking leg for a transit itinerary', () => {
    const props = {
      itinerary: dcw12.shortWalkingFirstLegWithMultipleViaPoints.data,
      intermediatePlaces:
        dcw12.shortWalkingFirstLegWithMultipleViaPoints.intermediatePlaces,
      passive: false,
      refTime: dcw12.shortWalkingFirstLegWithMultipleViaPoints.refTime,
    };
    const { container } = renderItinerary(props);

    const types = getLegTypes(container);
    expect(types.filter(t => t === 'via')).to.have.lengthOf(3);
    expect(types.filter(t => t === 'transit')).to.have.lengthOf(2);
    expect(types.filter(t => t === 'street').length).to.be.above(2);
  });

  it('should not indicate that there is a disruption if the alert is not in effect', () => {
    const alertEffectiveEndDate = 1553778000;
    const props = {
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
    const { container } = renderItinerary(props);
    expect(container.querySelector('.subicon-caution')).to.equal(null);
  });

  it('should indicate that there is a disruption due to a trip alert', () => {
    const props = {
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
    const { container } = renderItinerary(props);
    expect(container.querySelector('.subicon-caution')).to.not.equal(null);
  });

  it('should indicate that there is a disruption due to a route alert', () => {
    const props = {
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
    const { container } = renderItinerary(props);
    expect(container.querySelector('.subicon-caution')).to.not.equal(null);
  });

  it('should indicate that there is a disruption due to a stop alert at the "from" stop', () => {
    const props = {
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
    const { container } = renderItinerary(props);
    expect(container.querySelector('.subicon-caution')).to.not.equal(null);
  });

  it('should indicate that there is a disruption due to a stop alert at the "to" stop', () => {
    const props = {
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
    const { container } = renderItinerary(props);
    expect(container.querySelector('.subicon-caution')).to.not.equal(null);
  });

  it('should not indicate that there is a disruption due to a stop alert at an intermediate stop', () => {
    const props = {
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
    const { container } = renderItinerary(props);
    expect(container.querySelector('.subicon-caution')).to.equal(null);
  });

  it('should render a CAR leg with the car icon and a park-and-ride indicator', () => {
    const props = {
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
    const { container } = renderItinerary(props);

    expect(
      container.querySelector('.leg.car use')?.getAttribute('xlink:href'),
    ).to.equal('#icon_car');
    expect(container.querySelectorAll('.leg.car_park')).to.have.lengthOf(1);
  });

  it('should render a taxi leg with the external taxi icon and skip the transit bar even when a route is present', () => {
    const props = {
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
    const { container } = renderItinerary(props);

    expect(
      getLegTypes(container).filter(t => t === 'transit'),
    ).to.have.lengthOf(0);
    expect(
      container
        .querySelector('.leg.taxi-external use')
        ?.getAttribute('xlink:href'),
    ).to.equal(`#${mockContext.config.flex.taxiExternalIcon}`);
  });

  it('should render a scooter leg and suppress the CO2 summary even when emissions data is present', () => {
    const props = {
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
    const { container } = renderItinerary(props, {
      ...mockContext.config,
      showCO2InItinerarySummary: true,
    });

    expect(
      container.querySelector('.leg.scooter use')?.getAttribute('xlink:href'),
    ).to.not.equal(null);
    expect(
      container.querySelectorAll('.itinerary-co2-value-container'),
    ).to.have.lengthOf(0);
  });

  it('should show the CO2 leaf icon and total distance when configured and the itinerary has the lowest emissions', () => {
    const props = {
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
    const { container } = renderItinerary(props, {
      ...mockContext.config,
      showCO2InItinerarySummary: true,
      showDistanceInItinerarySummary: true,
    });

    expect(container.querySelectorAll('svg.co2-leaf')).to.have.lengthOf(1);
    expect(
      container.querySelector('.itinerary-co2-value').textContent,
    ).to.equal('42 g');
    expect(
      container.querySelector('.itinerary-total-distance').textContent,
    ).to.equal('1.5 km');
  });

  it('should show a short citybike duration warning when a single rental network exceeds its surcharge-free time', () => {
    const props = {
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
    const { container } = renderItinerary(props, {
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
    });

    const warning = container.querySelector('.citybike-duration-info-short');
    expect(warning).to.not.equal(null);
    expect(warning.textContent).to.contain('10 min');
  });

  it('should show the general citybike duration warning when more than one rental network exceeds its surcharge-free time', () => {
    const props = {
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
    const { container } = renderItinerary(props, {
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
    });

    const warning = container.querySelector('.citybike-duration-info-short');
    expect(warning).to.not.equal(null);
    expect(warning.textContent).to.contain(
      'Extra charge applies to several sections',
    );
  });

  it('should render the Feedback component when feedback is requested for a recommended itinerary', () => {
    const props = {
      giveFeedback: () => {},
      recommended: true,
      feedback: true,
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const { container } = renderItinerary(props);
    expect(container.querySelectorAll('.feedback-panel')).to.have.lengthOf(1);
  });

  it('should not render the Feedback component when feedback props are absent', () => {
    const props = {
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const { container } = renderItinerary(props);
    expect(container.querySelectorAll('.feedback-panel')).to.have.lengthOf(0);
  });

  it('should show an estimated time and dial-a-ride message for a call agency leg', () => {
    const props = {
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
    const { container } = renderItinerary(props);

    expect(
      container.querySelector('.itinerary-duration').textContent,
    ).to.contain('Estimate');
    expect(container.textContent).to.contain('Dial-a-ride service');
  });

  describe('selecting an itinerary', () => {
    const buildProps = extra => ({
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
      const { container } = renderItinerary(props, undefined, {
        ...mockContext.router,
        replace,
        push,
      });
      fireEvent.click(container.querySelector('.summary-clickable-area'));
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
      const { container } = renderItinerary(props, undefined, {
        ...mockContext.router,
        replace,
        push,
      });
      fireEvent.click(container.querySelector('.summary-clickable-area'));
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
      const { container } = renderItinerary(props, undefined, {
        ...mockContext.router,
        replace,
        push,
      });
      fireEvent.click(container.querySelector('.summary-clickable-area'));
      expect(push.calledOnce).to.equal(true);
      expect(focusToHeader.calledOnce).to.equal(true);
    });
  });
});
