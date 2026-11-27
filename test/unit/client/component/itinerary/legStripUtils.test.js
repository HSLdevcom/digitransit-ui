import {
  getStreetBarProps,
  getTransitLegLayout,
} from '../../../../../src/client/component/itinerary/legStripUtils';
import { mockContext } from '../../../helpers/mock-context';

const getStreetLeg = (legOverrides = {}, options = {}) => {
  const leg = {
    mode: 'WALK',
    duration: 179,
    start: { scheduledTime: '2026-11-06T10:00:00Z' },
    from: { name: 'Rental station' },
    to: {},
    ...legOverrides,
  };
  return getStreetBarProps({
    leg,
    index: 1,
    startMs: 123,
    legLength: 25,
    renderBar: true,
    renderModeIcons: true,
    usingOwnBicycle: false,
    bikeParkedIndex: 2,
    config: { flex: { taxiExternalIcon: 'icon_taxi' } },
    ...options,
  });
};

describe('getStreetBarProps', () => {
  it.each([
    ['WALK', false, 'walk'],
    ['BICYCLE_WALK', false, 'walk'],
    ['BICYCLE', false, 'BICYCLE'],
    ['BICYCLE', true, 'CITYBIKE'],
    ['CITYBIKE', true, 'CITYBIKE'],
    ['SCOOTER', true, 'SCOOTER'],
    ['CAR', false, 'CAR'],
    ['TAXI', false, 'taxi-external'],
  ])('preserves common data for %s (rented: %s)', (mode, rentedBike, expectedMode) => {
    const data = getStreetLeg({ mode, rentedBike });

    expect(data).toMatchObject({
      mode: expectedMode,
      leg: { mode, rentedBike },
      duration: 2,
      legLength: 25,
      key: mode === 'SCOOTER' ? 'SCOOTER_2026-11-06T10:00:00Z' : `${mode}_123`,
    });
    expect(data.renderModeIcons).toBe(mode === 'CAR' ? undefined : true);
  });

  it.each(['WALK', 'BICYCLE_WALK', 'BICYCLE'])('omits %s when its bar is hidden', mode => {
    expect(getStreetLeg({ mode }, { renderBar: false })).toBeNull();
  });

  it.each(['CAR', 'TAXI', 'CITYBIKE', 'SCOOTER'])('keeps %s even when renderBar is false', mode => {
    expect(getStreetLeg({ mode, rentedBike: true }, { renderBar: false })).not.toBeNull();
  });

  it.each(['BUS', 'CITYBIKE', 'SCOOTER'])('omits unsupported or non-rented %s legs', mode => {
    expect(getStreetLeg({ mode, rentedBike: false })).toBeNull();
  });

  it('uses bicycle-walk only before the bicycle is parked', () => {
    expect(getStreetLeg({}, { usingOwnBicycle: true }).mode).toBe('bicycle_walk');
    expect(getStreetLeg({}, { usingOwnBicycle: true, index: 2 }).mode).toBe('walk');
  });

  it.each([
    ['WALK', true, 'bike'],
    ['WALK', false, undefined],
    ['BICYCLE', false, 'bike'],
    ['CAR', false, 'car'],
  ])('preserves parking for %s (own bicycle: %s)', (mode, usingOwnBicycle, parkingIndicator) => {
    expect(
      getStreetLeg({ mode, to: { vehicleParking: {} } }, { usingOwnBicycle }).parkingIndicator,
    ).toBe(parkingIndicator);
    expect(getStreetLeg({ mode }, { usingOwnBicycle }).parkingIndicator).toBeUndefined();
  });

  it('preserves mode-specific icons and accessibility data', () => {
    expect(getStreetLeg({ mode: 'CAR' }).icon).toBe('icon_car');
    expect(getStreetLeg({ mode: 'TAXI' }).icon).toBe('icon_taxi');
    expect(getStreetLeg({ mode: 'BICYCLE', rentedBike: true })).toMatchObject({
      vehicleNameId: 'to-bicycle',
      stopName: 'Rental station',
    });
    expect(getStreetLeg({ mode: 'SCOOTER', rentedBike: true })).toMatchObject({
      vehicleNameId: 'to-e-scooter',
      stopName: '',
    });
  });
});

const getPresentation = (overrides = {}) => {
  const defaults = {
    leg: { from: {}, to: {}, mode: 'BUS', route: { mode: 'BUS' } },
    legLength: 10,
    longName: false,
    fitAllRouteNumbers: true,
    legWithRouteCount: 1,
    startsAtMarkedStation: false,
    viaPointAdded: false,
    nextLeg: null,
    usingOwnBicycleWholeTrip: false,
    usingOwnCarWholeTrip: false,
    config: { ...mockContext.config, bikeBoardingModes: {}, carBoardingModes: {} },
    waiting: false,
    waitTime: 0,
    waitLength: 0,
  };
  return getTransitLegLayout({ ...defaults, ...overrides });
};

describe('getTransitLegLayout', () => {
  it('identifies pass-through and via-stop-call markers unless a marker was added already', () => {
    const passThrough = getPresentation({
      leg: { from: { viaLocationType: 'PASS_THROUGH' }, to: {}, route: { mode: 'BUS' } },
    });
    const viaStopCall = getPresentation({
      leg: { from: {}, to: {}, viaStopCall: true, route: { mode: 'BUS' } },
    });
    const alreadyAdded = getPresentation({
      leg: { from: {}, to: {}, viaStopCall: true, route: { mode: 'BUS' } },
      viaPointAdded: true,
    });
    const markedStation = getPresentation({
      leg: { from: { viaLocationType: 'PASS_THROUGH' }, to: {}, route: { mode: 'BUS' } },
      startsAtMarkedStation: true,
    });

    expect(passThrough.showFromViaPoint).toBe(true);
    expect(viaStopCall.showFromViaPoint).toBe(true);
    expect(alreadyAdded.showFromViaPoint).toBe(false);
    expect(markedStation.showFromViaPoint).toBe(false);
  });

  it('shows a destination pass-through marker unless the next transit leg starts at a via point', () => {
    const leg = { from: {}, to: { viaLocationType: 'PASS_THROUGH' }, route: { mode: 'BUS' } };

    expect(getPresentation({ leg }).showToViaPoint).toBe(true);
    expect(
      getPresentation({
        leg,
        nextLeg: {
          transitLeg: true,
          interlineWithPreviousLeg: false,
          from: { viaLocationType: 'VISIT' },
        },
      }).showToViaPoint,
    ).toBe(false);
    expect(
      getPresentation({
        leg,
        nextLeg: { transitLeg: true, interlineWithPreviousLeg: false, from: {}, viaStopCall: true },
      }).showToViaPoint,
    ).toBe(false);
    expect(
      getPresentation({
        leg,
        nextLeg: {
          transitLeg: true,
          interlineWithPreviousLeg: true,
          from: { viaLocationType: 'VISIT' },
        },
      }).showToViaPoint,
    ).toBe(true);
    expect(
      getPresentation({ leg, nextLeg: { transitLeg: false, from: { viaLocationType: 'VISIT' } } })
        .showToViaPoint,
    ).toBe(true);
  });

  it('does not render a transit bar for a taxi leg with a route', () => {
    expect(
      getPresentation({ leg: { from: {}, to: {}, mode: 'TAXI', route: { mode: 'BUS' } } })
        .showTransitBar,
    ).toBe(false);
    expect(getPresentation().showTransitBar).toBe(true);
  });

  it('fits a route number only when the name or leg criteria allow it', () => {
    expect(getPresentation({ legLength: 13 }).fitRouteNumber).toBe(true);
    expect(
      getPresentation({ fitAllRouteNumbers: false, legLength: 13, longName: true }).fitRouteNumber,
    ).toBe(false);
    expect(
      getPresentation({ fitAllRouteNumbers: true, legLength: 13, longName: true }).fitRouteNumber,
    ).toBe(false);
    expect(getPresentation({ fitAllRouteNumbers: false, legLength: 10 }).fitRouteNumber).toBe(
      false,
    );
    expect(
      getPresentation({ fitAllRouteNumbers: false, legLength: 13, legWithRouteCount: 7 })
        .fitRouteNumber,
    ).toBe(false);
  });

  it.each([
    [true, false, 12, 3, true],
    [false, false, 12, 4, false],
    [false, false, 12.1, 4, true],
    [false, false, 12.1, 6, true],
    [false, false, 12.1, 7, false],
    [true, true, 12.1, 3, false],
    [false, true, 12.1, 6, false],
  ])(
    'fits route numbers with fitAll=%s, longName=%s, length=%s, count=%s: %s',
    (fitAllRouteNumbers, longName, legLength, legWithRouteCount, expected) => {
      expect(
        getPresentation({ fitAllRouteNumbers, longName, legLength, legWithRouteCount })
          .fitRouteNumber,
      ).toBe(expected);
    },
  );

  it('shows bike and car boarding icons only for configured modes used throughout the trip', () => {
    const result = getPresentation({
      usingOwnBicycleWholeTrip: true,
      usingOwnCarWholeTrip: true,
      config: {
        ...mockContext.config,
        bikeBoardingModes: { BUS: {} },
        carBoardingModes: { BUS: {} },
      },
    });

    expect(result.withBicycle).toBe(true);
    expect(result.withCar).toBe(true);
    expect(
      getPresentation({
        usingOwnBicycleWholeTrip: false,
        config: {
          ...mockContext.config,
          bikeBoardingModes: { BUS: {} },
          carBoardingModes: { BUS: {} },
        },
      }).withBicycle,
    ).toBe(false);
    expect(
      getPresentation({
        usingOwnCarWholeTrip: false,
        config: { ...mockContext.config, bikeBoardingModes: {}, carBoardingModes: { BUS: {} } },
      }).withCar,
    ).toBe(false);
  });

  it('renders long waits except before interlined legs and selects the car wait icon', () => {
    const waiting = getPresentation({
      waiting: true,
      waitTime: 300000,
      waitLength: 15,
      usingOwnCarWholeTrip: true,
    });
    const interlinedWait = getPresentation({
      waiting: true,
      nextLeg: { interlineWithPreviousLeg: true },
    });

    expect(waiting.showWaitBar).toBe(true);
    expect(waiting.waitDuration).toBe(5);
    expect(waiting.waitLength).toBe(15);
    expect(waiting.waitIcon).toBe('icon_wait-car');
    expect(interlinedWait.showWaitBar).toBe(false);
    expect(getPresentation().showWaitBar).toBe(false);
    expect(getPresentation().waitIcon).toBe('icon_wait_standing');
  });
});
