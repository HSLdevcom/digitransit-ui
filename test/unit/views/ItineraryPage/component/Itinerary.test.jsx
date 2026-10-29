import { fireEvent } from '@testing-library/react';

import Itinerary from '../../../../../app/component/itinerary/Itinerary';
import {
  AlertSeverityLevelType,
  ExtendedRouteTypes,
} from '../../../../../utils/shared/constants';
import { mockContext } from '../../../helpers/mock-context';
import { renderWithProviders } from '../../../helpers/mock-providers';
import { ignoreRelayModernSelectorWarning } from '../../../helpers/relay-selector-warning';
import dcw12 from '../../../test-data/dcw12';

const defaultProps = {
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
  // Itinerary calls useFragment on plain leg data - see
  // ignoreRelayModernSelectorWarning's own comment for why this is needed.
  ignoreRelayModernSelectorWarning();

  const renderItinerary = (props, config, router, breakpoint = 'large') =>
    renderWithProviders(<Itinerary {...defaultProps} {...props} />, {
      breakpoint,
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
    expect(types).toHaveLength(3);
    expect(types.filter(t => t === 'via')).toHaveLength(1);
    expect(types.filter(t => t === 'street')).toHaveLength(2);
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
    expect(types.filter(t => t === 'street').length).toBeGreaterThan(3);
    expect(types.filter(t => t === 'via')).toHaveLength(2);
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
    expect(types).toEqual(['street', 'via', 'street', 'via', 'street']);
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
    expect(types.filter(t => t === 'via')).toHaveLength(2);
    expect(types.filter(t => t === 'transit')).toHaveLength(2);
    expect(types.filter(t => t === 'street').length).toBeGreaterThan(0);
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
    expect(types).toHaveLength(4);
    expect(types[0]).toBe('transit');
    // Mirrors the original suite's check (its `legs.length` was 1, so this
    // asserted index 1, not the actual last leg).
    expect(types[1]).toBe('street');
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
    expect(types).toHaveLength(4);
    expect(types[0]).toBe('street');
    expect(types[1]).toBe('via');
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

    expect(getLegTypes(container).filter(t => t === 'via')).toHaveLength(1);
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
    expect(types.filter(t => t === 'via')).toHaveLength(3);
    expect(types.filter(t => t === 'transit')).toHaveLength(2);
    expect(types.filter(t => t === 'street').length).toBeGreaterThan(2);
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
    expect(container.querySelector('.subicon-caution')).toBeNull();
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
    expect(container.querySelector('.subicon-caution')).not.toBeNull();
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
    expect(container.querySelector('.subicon-caution')).not.toBeNull();
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
    expect(container.querySelector('.subicon-caution')).not.toBeNull();
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
    expect(container.querySelector('.subicon-caution')).not.toBeNull();
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
    expect(container.querySelector('.subicon-caution')).toBeNull();
  });

  describe('alert badge in the summary view', () => {
    const startMs = 1553769600000;
    const iso = ms => new Date(ms).toISOString();
    const alertOf = (level, extra = {}) => ({
      alertSeverityLevel: level,
      effectiveStartDate: startMs / 1000 - 600,
      effectiveEndDate: startMs / 1000 + 6000,
      ...extra,
    });
    const transitLeg = (offsetMs, overrides = {}) => ({
      from: {},
      to: {},
      mode: 'RAIL',
      route: { alerts: [], mode: 'RAIL' },
      start: { scheduledTime: iso(startMs + offsetMs) },
      end: { scheduledTime: iso(startMs + offsetMs + 600000) },
      ...overrides,
    });
    const itineraryOf = (...legs) => ({
      itinerary: {
        start: iso(startMs),
        end: iso(startMs + 3600000),
        legs,
      },
    });

    it.each([AlertSeverityLevelType.Severe, AlertSeverityLevelType.Unknown])(
      'should show a caution badge for a %s alert',
      level => {
        const { container } = renderItinerary(
          itineraryOf(
            transitLeg(0, {
              route: { alerts: [alertOf(level)], mode: 'RAIL' },
            }),
          ),
        );
        expect(container.querySelector('.subicon-caution')).not.toBeNull();
      },
    );

    it('should show an info badge instead of a caution badge for an info alert', () => {
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0, {
            route: {
              alerts: [alertOf(AlertSeverityLevelType.Info)],
              mode: 'RAIL',
            },
          }),
        ),
      );
      expect(container.querySelector('.subicon-info')).not.toBeNull();
      expect(container.querySelector('.subicon-caution')).toBeNull();
    });

    it('should show the caution badge when info and warning alerts are combined', () => {
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0, {
            route: {
              alerts: [alertOf(AlertSeverityLevelType.Info)],
              mode: 'RAIL',
            },
            from: {
              stop: { alerts: [alertOf(AlertSeverityLevelType.Warning)] },
            },
          }),
        ),
      );
      expect(container.querySelector('.subicon-caution')).not.toBeNull();
      expect(container.querySelector('.subicon-info')).toBeNull();
    });

    it('should show a badge for a stop alert that starts while the leg is under way', () => {
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0, {
            to: {
              stop: {
                alerts: [
                  alertOf(AlertSeverityLevelType.Warning, {
                    effectiveStartDate: startMs / 1000 + 300,
                    effectiveEndDate: startMs / 1000 + 6000,
                  }),
                ],
              },
            },
          }),
        ),
      );
      expect(container.querySelector('.subicon-caution')).not.toBeNull();
    });

    it('should not show a badge for an alert that only starts after the leg has ended', () => {
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0, {
            route: {
              alerts: [
                alertOf(AlertSeverityLevelType.Warning, {
                  effectiveStartDate: startMs / 1000 + 7200,
                  effectiveEndDate: startMs / 1000 + 9000,
                }),
              ],
              mode: 'RAIL',
            },
          }),
        ),
      );
      expect(container.querySelector('.subicon-caution')).toBeNull();
    });

    it('should show a caution badge for a canceled leg', () => {
      const { container } = renderItinerary(
        itineraryOf(transitLeg(0, { realtimeState: 'CANCELED' })),
      );
      expect(container.querySelector('.subicon-caution')).not.toBeNull();
    });

    it.each([
      ['from', 'from'],
      ['to', 'to'],
    ])(
      'should show an info badge for an info alert at the "%s" stop',
      place => {
        const { container } = renderItinerary(
          itineraryOf(
            transitLeg(0, {
              [place]: {
                stop: { alerts: [alertOf(AlertSeverityLevelType.Info)] },
              },
            }),
          ),
        );
        expect(container.querySelector('.subicon-info')).not.toBeNull();
        expect(container.querySelector('.subicon-caution')).toBeNull();
      },
    );

    it('should ignore an alert that expired before the leg started', () => {
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0, {
            route: {
              alerts: [
                alertOf(AlertSeverityLevelType.Severe, {
                  effectiveStartDate: startMs / 1000 - 7200,
                  effectiveEndDate: startMs / 1000 - 600,
                }),
              ],
              mode: 'RAIL',
            },
          }),
        ),
      );
      expect(container.querySelector('.subicon-caution')).toBeNull();
    });

    it('should use the estimated start time when deciding if an alert is active', () => {
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0, {
            start: {
              scheduledTime: iso(startMs),
              estimated: { time: iso(startMs + 7200000) },
            },
            end: { scheduledTime: iso(startMs + 7800000) },
            route: {
              alerts: [alertOf(AlertSeverityLevelType.Warning)],
              mode: 'RAIL',
            },
          }),
        ),
      );
      expect(container.querySelector('.subicon-caution')).toBeNull();
    });

    it('should badge each of several alerted legs separately', () => {
      const warn = mode => ({
        mode,
        route: { alerts: [alertOf(AlertSeverityLevelType.Warning)], mode },
      });
      const info = mode => ({
        mode,
        route: { alerts: [alertOf(AlertSeverityLevelType.Info)], mode },
      });
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0, warn('RAIL')),
          transitLeg(1800000, info('BUS')),
        ),
      );
      expect(
        container.querySelector('.leg.rail .subicon-caution'),
      ).not.toBeNull();
      expect(container.querySelector('.leg.bus .subicon-info')).not.toBeNull();
    });

    it('should badge only the leg that has the alert in a multi-leg itinerary', () => {
      const { container } = renderItinerary(
        itineraryOf(
          transitLeg(0),
          transitLeg(1800000, {
            mode: 'BUS',
            route: {
              alerts: [alertOf(AlertSeverityLevelType.Warning)],
              mode: 'BUS',
            },
          }),
        ),
      );
      expect(container.querySelectorAll('.subicon-caution')).toHaveLength(1);
      expect(container.querySelector('.leg.rail .subicon-caution')).toBeNull();
      expect(
        container.querySelector('.leg.bus .subicon-caution'),
      ).not.toBeNull();
    });
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
    ).toBe('#icon_car');
    expect(container.querySelectorAll('.leg.car_park')).toHaveLength(1);
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

    expect(getLegTypes(container).filter(t => t === 'transit')).toHaveLength(0);
    expect(
      container
        .querySelector('.leg.taxi-external use')
        ?.getAttribute('xlink:href'),
    ).toBe(`#${mockContext.config.flex.taxiExternalIcon}`);
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
    ).not.toBeNull();
    expect(
      container.querySelectorAll('.itinerary-co2-value-container'),
    ).toHaveLength(0);
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

    expect(container.querySelectorAll('svg.co2-leaf')).toHaveLength(1);
    expect(container.querySelector('.itinerary-co2-value').textContent).toBe(
      '42 g',
    );
    expect(
      container.querySelector('.itinerary-total-distance').textContent,
    ).toBe('1.5 km');
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
    expect(warning).not.toBeNull();
    expect(warning.textContent).toContain('10 min');
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
    expect(warning).not.toBeNull();
    expect(warning.textContent).toContain(
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
    expect(container.querySelectorAll('.feedback-panel')).toHaveLength(1);
  });

  it('should not render the Feedback component when feedback props are absent', () => {
    const props = {
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    };
    const { container } = renderItinerary(props);
    expect(container.querySelectorAll('.feedback-panel')).toHaveLength(0);
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
      container.querySelector('.itinerary-start-time-and-end-time').textContent,
    ).toContain('Estimate');
    expect(container.querySelector('.itinerary-duration').textContent).toMatch(
      /^~/,
    );
    expect(container.textContent).toContain('Dial-a-ride service');
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
      const replace = vi.fn();
      const push = vi.fn();
      const focusToHeader = vi.fn();
      const props = buildProps({ passive: false, focusToHeader });
      const { container } = renderItinerary(props, undefined, {
        ...mockContext.router,
        replace,
        push,
      });
      fireEvent.click(container.querySelector('.summary-clickable-area'));
      expect(replace.mock.calls.length).toBe(1);
      expect(push.mock.calls.length).toBe(1);
      expect(focusToHeader.mock.calls.length).toBe(1);
    });

    it('should only highlight the itinerary without navigating when passive on a large breakpoint', () => {
      const replace = vi.fn();
      const push = vi.fn();
      const focusToHeader = vi.fn();
      const props = buildProps({
        passive: true,
        focusToHeader,
      });
      const { container } = renderItinerary(props, undefined, {
        ...mockContext.router,
        replace,
        push,
      });
      fireEvent.click(container.querySelector('.summary-clickable-area'));
      expect(push.mock.calls.length > 0).toBe(false);
      expect(replace.mock.calls.length).toBe(1);
      expect(replace.mock.calls[0][0].state.selectedItineraryIndex).toBe(2);
      expect(focusToHeader.mock.calls.length > 0).toBe(false);
    });

    it('should still navigate immediately on a mobile breakpoint even when passive', () => {
      const replace = vi.fn();
      const push = vi.fn();
      const focusToHeader = vi.fn();
      const props = buildProps({
        passive: true,
        focusToHeader,
      });
      const { container } = renderItinerary(
        props,
        undefined,
        {
          ...mockContext.router,
          replace,
          push,
        },
        'small',
      );
      fireEvent.click(container.querySelector('.summary-clickable-area'));
      expect(push.mock.calls.length).toBe(1);
      expect(focusToHeader.mock.calls.length).toBe(1);
    });
  });
});
