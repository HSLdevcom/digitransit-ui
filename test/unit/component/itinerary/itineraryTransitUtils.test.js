import { getItineraryTransitPresentation } from '../../../../app/component/itinerary/itineraryTransitUtils';
import { mockContext } from '../../helpers/mock-context';

const getPresentation = (overrides = {}) => {
  const defaults = {
    leg: {
      from: {},
      to: {},
      mode: 'BUS',
      route: { mode: 'BUS' },
    },
    legLength: 10,
    longName: false,
    fitAllRouteNumbers: true,
    legWithRouteCount: 1,
    startsAtMarkedStation: false,
    viaPointAdded: false,
    nextLeg: null,
    usingOwnBicycleWholeTrip: false,
    usingOwnCarWholeTrip: false,
    config: {
      ...mockContext.config,
      bikeBoardingModes: {},
      carBoardingModes: {},
    },
    waiting: false,
    waitTime: 0,
    waitLength: 0,
  };
  return getItineraryTransitPresentation({ ...defaults, ...overrides });
};

describe('getItineraryTransitPresentation', () => {
  it('identifies pass-through and via-stop-call markers unless a marker was added already', () => {
    const passThrough = getPresentation({
      leg: {
        from: { viaLocationType: 'PASS_THROUGH' },
        to: {},
        route: { mode: 'BUS' },
      },
    });
    const viaStopCall = getPresentation({
      leg: { from: {}, to: {}, viaStopCall: true, route: { mode: 'BUS' } },
    });
    const alreadyAdded = getPresentation({
      leg: { from: {}, to: {}, viaStopCall: true, route: { mode: 'BUS' } },
      viaPointAdded: true,
    });
    const markedStation = getPresentation({
      leg: {
        from: { viaLocationType: 'PASS_THROUGH' },
        to: {},
        route: { mode: 'BUS' },
      },
      startsAtMarkedStation: true,
    });

    expect(passThrough.showFromViaPoint).toBe(true);
    expect(viaStopCall.showFromViaPoint).toBe(true);
    expect(alreadyAdded.showFromViaPoint).toBe(false);
    expect(markedStation.showFromViaPoint).toBe(false);
  });

  it('shows a destination pass-through marker unless the next transit leg starts at a via point', () => {
    const leg = {
      from: {},
      to: { viaLocationType: 'PASS_THROUGH' },
      route: { mode: 'BUS' },
    };

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
        nextLeg: {
          transitLeg: true,
          interlineWithPreviousLeg: false,
          from: {},
          viaStopCall: true,
        },
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
      getPresentation({
        leg,
        nextLeg: { transitLeg: false, from: { viaLocationType: 'VISIT' } },
      }).showToViaPoint,
    ).toBe(true);
  });

  it('does not render a transit bar for a taxi leg with a route', () => {
    expect(
      getPresentation({
        leg: { from: {}, to: {}, mode: 'TAXI', route: { mode: 'BUS' } },
      }).showTransitBar,
    ).toBe(false);
    expect(getPresentation().showTransitBar).toBe(true);
  });

  it('fits a route number only when the name or leg criteria allow it', () => {
    expect(getPresentation({ legLength: 13 }).fitRouteNumber).toBe(true);
    expect(
      getPresentation({
        fitAllRouteNumbers: false,
        legLength: 13,
        longName: true,
      }).fitRouteNumber,
    ).toBe(false);
    expect(
      getPresentation({
        fitAllRouteNumbers: true,
        legLength: 13,
        longName: true,
      }).fitRouteNumber,
    ).toBe(false);
    expect(
      getPresentation({
        fitAllRouteNumbers: false,
        legLength: 10,
      }).fitRouteNumber,
    ).toBe(false);
    expect(
      getPresentation({
        fitAllRouteNumbers: false,
        legLength: 13,
        legWithRouteCount: 7,
      }).fitRouteNumber,
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
        getPresentation({
          fitAllRouteNumbers,
          longName,
          legLength,
          legWithRouteCount,
        }).fitRouteNumber,
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
        config: {
          ...mockContext.config,
          bikeBoardingModes: {},
          carBoardingModes: { BUS: {} },
        },
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
