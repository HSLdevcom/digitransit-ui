import { act, fireEvent } from '@testing-library/react';

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

const timeAtMinute = minutes =>
  new Date(1553769600000 + minutes * 60 * 1000).toISOString();

const makeTransitLeg = (mode, startMinute, endMinute) => ({
  from: {},
  to: {},
  mode,
  duration: (endMinute - startMinute) * 60,
  route: { mode, shortName: mode, alerts: [] },
  start: { scheduledTime: timeAtMinute(startMinute) },
  end: { scheduledTime: timeAtMinute(endMinute) },
});

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

  const renderItinerary = (
    props,
    config,
    router,
    breakpoint = 'large',
    options = {},
  ) => {
    const { match } = options;
    return renderWithProviders(<Itinerary {...defaultProps} {...props} />, {
      breakpoint,
      ...(config ? { config } : {}),
      ...(router ? { router } : {}),
      ...(match ? { match } : {}),
    });
  };

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

  it('should show the overflow icon when the itinerary legs exceed their container', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(101);
    const { container } = renderItinerary({
      itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
      intermediatePlaces:
        dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
      refTime: dcw12.walkingRouteWithIntermediatePlace.refTime,
    });

    expect(
      container.querySelector('.overflow-icon-container .overflow-icon'),
    ).not.toBeNull();
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

  it('should not duplicate visit markers at the same station', () => {
    const firstLeg = {
      ...makeTransitLeg('WALK', 0, 10),
      route: null,
      from: {
        stop: { gtfsId: 'test:station' },
        viaLocationType: 'VISIT',
      },
    };
    const secondLeg = {
      ...makeTransitLeg('WALK', 10, 20),
      route: null,
      from: {
        stop: { gtfsId: 'test:station' },
        viaLocationType: 'VISIT',
      },
    };
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(20),
        legs: [firstLeg, secondLeg],
      },
    };
    const { container } = renderItinerary(props);

    expect(getLegTypes(container).filter(type => type === 'via')).toHaveLength(
      1,
    );
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

  it('should render an owned bicycle leg with a bike parking indicator', () => {
    const props = {
      itinerary: {
        start: new Date(1553769600000).toISOString(),
        end: new Date(1553770200000).toISOString(),
        legs: [
          {
            from: {},
            to: { vehicleParking: true },
            mode: 'BICYCLE',
            rentedBike: false,
            duration: 600,
            distance: 3000,
            route: null,
            start: { scheduledTime: new Date(1553769600000).toISOString() },
            end: { scheduledTime: new Date(1553770200000).toISOString() },
          },
        ],
      },
    };
    const { container } = renderItinerary(props);

    expect(container.querySelector('.leg.bicycle')).not.toBeNull();
    expect(container.querySelectorAll('.leg.bike_park')).toHaveLength(1);
  });

  it('should show a bike parking indicator at the end of a walk after cycling', () => {
    const bicycleLeg = {
      from: {},
      to: {},
      mode: 'BICYCLE',
      rentedBike: false,
      duration: 600,
      distance: 3000,
      route: null,
      start: { scheduledTime: timeAtMinute(0) },
      end: { scheduledTime: timeAtMinute(10) },
    };
    const walkingLeg = {
      from: { viaLocationType: 'VISIT' },
      to: { vehicleParking: true },
      mode: 'WALK',
      duration: 600,
      distance: 500,
      route: null,
      start: { scheduledTime: timeAtMinute(10) },
      end: { scheduledTime: timeAtMinute(20) },
    };
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(20),
        legs: [bicycleLeg, walkingLeg],
      },
    };
    const { container } = renderItinerary(props);

    expect(container.querySelector('.leg.walk')).not.toBeNull();
    expect(container.querySelectorAll('.leg.bike_park')).toHaveLength(1);
  });

  it('should show the bicycle-on-transit icon for an own-bicycle itinerary', () => {
    const bicycleLeg = {
      from: {},
      to: {},
      mode: 'BICYCLE',
      rentedBike: false,
      duration: 600,
      distance: 3000,
      route: null,
      start: { scheduledTime: timeAtMinute(0) },
      end: { scheduledTime: timeAtMinute(10) },
    };
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(20),
        legs: [bicycleLeg, makeTransitLeg('RAIL', 10, 20)],
      },
    };
    const { container } = renderItinerary(props, {
      ...mockContext.config,
      bikeBoardingModes: { RAIL: {} },
    });

    expect(
      container.querySelector('.leg.rail .itinerary-icon_with-bicycle'),
    ).not.toBeNull();
  });

  it('should show the car-on-transit icon for an own-car itinerary', () => {
    const carLeg = {
      from: {},
      to: {},
      mode: 'CAR',
      duration: 600,
      distance: 3000,
      route: null,
      start: { scheduledTime: timeAtMinute(0) },
      end: { scheduledTime: timeAtMinute(10) },
    };
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(20),
        legs: [carLeg, makeTransitLeg('RAIL', 10, 20)],
      },
    };
    const { container } = renderItinerary(props, {
      ...mockContext.config,
      carBoardingModes: { RAIL: {} },
    });

    expect(
      container.querySelector('.leg.rail .itinerary-icon_with-car'),
    ).not.toBeNull();
  });

  it('should render a separate wait bar for a long transfer', () => {
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(25),
        legs: [makeTransitLeg('RAIL', 0, 10), makeTransitLeg('BUS', 15, 25)],
      },
    };
    const { container } = renderItinerary(props);

    expect(container.querySelectorAll('.leg.wait')).toHaveLength(1);
  });

  it('should use the car wait icon on a whole-trip car itinerary', () => {
    const carLeg = {
      from: {},
      to: {},
      mode: 'CAR',
      duration: 600,
      distance: 3000,
      route: null,
      start: { scheduledTime: timeAtMinute(0) },
      end: { scheduledTime: timeAtMinute(10) },
    };
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(30),
        legs: [carLeg, makeTransitLeg('RAIL', 20, 30)],
      },
    };
    const { container } = renderItinerary(props, {
      ...mockContext.config,
      carBoardingModes: {},
    });

    expect(
      container.querySelector('.leg.wait use')?.getAttribute('xlink:href'),
    ).toBe('#icon_wait-car');
  });

  it('should include a short transfer wait in the preceding leg instead of a wait bar', () => {
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(21),
        legs: [makeTransitLeg('RAIL', 0, 10), makeTransitLeg('BUS', 11, 21)],
      },
    };
    const { container } = renderItinerary(props);

    expect(container.querySelectorAll('.leg.wait')).toHaveLength(0);
  });

  it('should render a pass-through marker once between transit legs', () => {
    const firstLeg = makeTransitLeg('RAIL', 0, 10);
    firstLeg.to = { viaLocationType: 'PASS_THROUGH' };
    const nextLeg = makeTransitLeg('BUS', 10, 20);
    nextLeg.transitLeg = true;
    nextLeg.from = { viaLocationType: 'PASS_THROUGH' };
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(20),
        legs: [firstLeg, nextLeg],
      },
    };
    const { container } = renderItinerary(props);

    expect(getLegTypes(container).filter(type => type === 'via')).toHaveLength(
      1,
    );
    expect(
      getLegTypes(container).filter(type => type === 'transit'),
    ).toHaveLength(2);
  });

  it('should render a via marker for a transit leg with a via stop call', () => {
    const leg = makeTransitLeg('RAIL', 0, 10);
    leg.viaStopCall = true;
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(10),
        legs: [leg],
      },
    };
    const { container } = renderItinerary(props);

    expect(getLegTypes(container).filter(type => type === 'via')).toHaveLength(
      1,
    );
  });

  it('should render only one marker when a transit visit is also a via stop call', () => {
    const leg = makeTransitLeg('RAIL', 0, 10);
    leg.from = { viaLocationType: 'VISIT' };
    leg.viaStopCall = true;
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(10),
        legs: [leg],
      },
    };
    const { container } = renderItinerary(props);

    expect(getLegTypes(container).filter(type => type === 'via')).toHaveLength(
      1,
    );
  });

  it('should not render a wait bar before an interlined transit leg', () => {
    const firstLeg = makeTransitLeg('RAIL', 0, 10);
    const interlinedLeg = makeTransitLeg('BUS', 15, 25);
    interlinedLeg.interlineWithPreviousLeg = true;
    const props = {
      itinerary: {
        start: timeAtMinute(0),
        end: timeAtMinute(25),
        legs: [firstLeg, interlinedLeg],
      },
    };
    const { container } = renderItinerary(props);

    expect(container.querySelectorAll('.leg.wait')).toHaveLength(0);
    expect(
      getLegTypes(container).filter(type => type === 'transit'),
    ).toHaveLength(1);
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

  it.each([
    ['below the surcharge limit', 599, 600, 'https://example.org/pricing'],
    ['at the surcharge limit', 600, 600, 'https://example.org/pricing'],
    ['without duration instructions', 900, 600, undefined],
    [
      'without a surcharge limit',
      900,
      undefined,
      'https://example.org/pricing',
    ],
  ])(
    'should use the rental vehicle network and omit the warning %s',
    (description, duration, timeBeforeSurcharge, durationInstructions) => {
      const props = {
        itinerary: {
          start: timeAtMinute(0),
          end: timeAtMinute(10),
          legs: [
            {
              from: {
                rentalVehicle: {
                  rentalNetwork: { networkId: 'testnetwork' },
                },
              },
              to: {},
              mode: 'BICYCLE',
              rentedBike: true,
              duration,
              distance: 3000,
              route: null,
              start: { scheduledTime: timeAtMinute(0) },
              end: { scheduledTime: timeAtMinute(10) },
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
              timeBeforeSurcharge,
              durationInstructions,
            },
          },
        },
      });

      expect(container.querySelector('.leg.citybike')).not.toBeNull();
      expect(
        container.querySelector('.citybike-duration-info-short'),
      ).toBeNull();
    },
  );

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

  it.each([1, 2])(
    'should show a short citybike duration warning for %i legs exceeding the limit on the same network',
    legCount => {
      const props = {
        itinerary: {
          start: new Date(1553769600000).toISOString(),
          end: timeAtMinute(15 * legCount),
          legs: Array.from({ length: legCount }, (_, index) => ({
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
            start: { scheduledTime: timeAtMinute(15 * index) },
            end: { scheduledTime: timeAtMinute(15 * (index + 1)) },
          })),
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
    },
  );

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

  it('should expand unanswered feedback after one second', () => {
    vi.useFakeTimers();
    try {
      const { container } = renderItinerary({
        itinerary: dcw12.walkingRouteWithIntermediatePlace.data,
        intermediatePlaces:
          dcw12.walkingRouteWithIntermediatePlace.intermediatePlaces,
        recommended: true,
        giveFeedback: () => {},
      });
      const feedback = container.querySelector('.feedback-animated');

      expect(feedback.className).not.toContain('open');
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(feedback.className).toContain('open');
    } finally {
      vi.useRealTimers();
    }
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

    it('should preserve the selected mode in the itinerary details path', () => {
      const replace = vi.fn();
      const push = vi.fn();
      const match = {
        ...mockContext.match,
        location: { ...mockContext.match.location, state: { existing: true } },
        params: {
          from: 'origin',
          to: 'destination',
          hash: 'bikeAndVehicle',
        },
      };
      const { container } = renderItinerary(
        buildProps({ passive: false }),
        undefined,
        { ...mockContext.router, replace, push },
        'large',
        { match },
      );

      fireEvent.click(container.querySelector('.summary-clickable-area'));

      expect(replace.mock.calls[0][0].pathname).toBe(
        '/reitti/origin/destination/bikeAndVehicle/',
      );
      expect(push.mock.calls[0][0].pathname).toBe(
        '/reitti/origin/destination/bikeAndVehicle/2',
      );
      expect(push.mock.calls[0][0].state).toEqual({
        existing: true,
        selectedItineraryIndex: 2,
      });
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

    it('should highlight the itinerary when selected with the keyboard', () => {
      const replace = vi.fn();
      const push = vi.fn();
      const { container } = renderItinerary(
        buildProps({ passive: true }),
        undefined,
        {
          ...mockContext.router,
          replace,
          push,
        },
      );

      fireEvent.keyPress(container.querySelector('.summary-clickable-area'), {
        key: 'Enter',
        charCode: 13,
        keyCode: 13,
      });

      expect(replace.mock.calls).toHaveLength(1);
      expect(replace.mock.calls[0][0].state.selectedItineraryIndex).toBe(2);
      expect(push).not.toHaveBeenCalled();
    });
  });
});
