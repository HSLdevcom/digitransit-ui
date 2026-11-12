import { getItineraryLegSummary } from '../../../../app/component/itinerary/itinerarySummaryUtils';
import { mockContext } from '../../helpers/mock-context';

const startTime = Date.parse('2026-01-01T10:00:00Z');

const makeLeg = (mode, startOffset, duration, overrides = {}) => ({
  mode,
  duration,
  from: {},
  to: {},
  start: {
    scheduledTime: new Date(startTime + startOffset).toISOString(),
  },
  end: {
    scheduledTime: new Date(
      startTime + startOffset + duration * 1000,
    ).toISOString(),
  },
  ...(mode === 'RAIL' || mode === 'BUS'
    ? {
        transitLeg: true,
        route: { mode, shortName: mode, alerts: [] },
      }
    : {}),
  ...overrides,
});

const getSummary = (legs, options = {}) =>
  getItineraryLegSummary({
    legs,
    intermediatePlaces: [],
    config: mockContext.config,
    breakpoint: 'large',
    duration: legs.reduce((total, leg) => total + leg.duration * 1000, 0),
    ...options,
  });

describe('getItineraryLegSummary', () => {
  it('normalizes leg widths against itinerary duration', () => {
    const summary = getSummary([makeLeg('RAIL', 0, 600)]);

    expect(summary.normalizedLegs).toMatchObject([
      { legLength: 100, renderBar: true, skipped: false },
    ]);
    expect(summary.fitAllRouteNumbers).toBe(true);
    expect(summary.renderModeIcons).toBe(true);
  });

  it('uses the breakpoint threshold when deciding whether to render a short walk', () => {
    const legs = [makeLeg('WALK', 0, 40), makeLeg('RAIL', 40000, 560)];

    const largeSummary = getSummary(legs);
    const smallSummary = getSummary(legs, { breakpoint: 'small' });

    expect(largeSummary.normalizedLegs[0].renderBar).toBe(true);
    expect(smallSummary.normalizedLegs[0].renderBar).toBe(false);
  });

  it('reports own-bicycle and parking state from compressed legs', () => {
    const summary = getSummary([
      makeLeg('BICYCLE', 0, 300, {
        rentedBike: false,
        to: { vehicleParking: true },
      }),
      makeLeg('RAIL', 300000, 300),
    ]);

    expect(summary.usingOwnBicycle).toBe(true);
    expect(summary.usingOwnBicycleWholeTrip).toBe(false);
    expect(summary.bikeParkedIndex).toBe(0);
  });

  it('reports route label and route-number display settings', () => {
    const legs = Array.from({ length: 4 }, (_, index) =>
      makeLeg('RAIL', index * 600000, 600, {
        route: {
          mode: 'RAIL',
          shortName: `Long route name ${index}`,
          alerts: [],
        },
      }),
    );
    const summary = getSummary(legs, { duration: 2400000 });

    expect(summary.legWithRouteCount).toBe(4);
    expect(summary.fitAllRouteNumbers).toBe(false);
    expect(summary.shortenLabels).toBe(true);
  });

  it('reports whole-trip car use and scooter presence', () => {
    const carSummary = getSummary([makeLeg('CAR', 0, 600)]);
    const scooterSummary = getSummary([makeLeg('SCOOTER', 0, 600)]);

    expect(carSummary.usingOwnCarWholeTrip).toBe(true);
    expect(scooterSummary.containsScooterLeg).toBe(true);
  });

  it.each([3, 4])('sets route-number fitting at %i transit legs', count => {
    const legs = Array.from({ length: count }, (_, index) =>
      makeLeg('RAIL', index * 600000, 600, {
        route: { mode: 'RAIL', shortName: `R${index}`, alerts: [] },
      }),
    );
    const summary = getSummary(legs);

    expect(summary.legWithRouteCount).toBe(count);
    expect(summary.fitAllRouteNumbers).toBe(count < 4);
  });
});
