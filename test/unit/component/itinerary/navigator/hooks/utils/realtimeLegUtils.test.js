import {
  getLegsOfInterest,
  matchLegEnds,
} from '../../../../../../../app/component/itinerary/navigator/hooks/utils/realtimeLegUtils';
import { legTime } from '../../../../../../../utils/client/legUtils';

const at = ms => ({ scheduledTime: new Date(ms).toISOString() });

describe('getLegsOfInterest', () => {
  it('returns all undefined for an empty/missing legs array', () => {
    expect(getLegsOfInterest([], 0)).toEqual({
      firstLeg: undefined,
      lastLeg: undefined,
      currentLeg: undefined,
      nextLeg: undefined,
    });
    expect(getLegsOfInterest(undefined, 0)).toEqual({
      firstLeg: undefined,
      lastLeg: undefined,
      currentLeg: undefined,
      nextLeg: undefined,
    });
  });

  it('reports only previousLeg/lastLeg once the whole itinerary has finished', () => {
    const legs = [
      { mode: 'WALK', start: at(0), end: at(5 * 60000) },
      { mode: 'BUS', start: at(5 * 60000), end: at(10 * 60000) },
    ];

    const result = getLegsOfInterest(legs, 20 * 60000);

    expect(result.currentLeg).toBeUndefined();
    expect(result.nextLeg).toBeUndefined();
    expect(result.previousLeg).toBe(legs[1]);
    expect(result.firstLeg).toBe(legs[0]);
    expect(result.lastLeg).toBe(legs[1]);
  });

  it('finds no currentLeg but the correct nextLeg while sitting in an uncovered gap between legs', () => {
    // A genuine gap can still exist between two legs (e.g. matchLegEnds
    // hasn't run, or geolocation shifting is disabled) - "now" falls after
    // leg 0 ends but before leg 1 starts.
    const legs = [
      { mode: 'WALK', start: at(0), end: at(5 * 60000) },
      { mode: 'BUS', start: at(8 * 60000), end: at(15 * 60000) },
    ];

    const result = getLegsOfInterest(legs, 6 * 60000);

    expect(result.currentLeg).toBeUndefined();
    expect(result.previousLeg).toBe(legs[0]);
    expect(result.nextLeg).toBe(legs[1]);
  });

  it('has no previousLeg before the itinerary has started', () => {
    const legs = [{ mode: 'WALK', start: at(5 * 60000), end: at(10 * 60000) }];

    const result = getLegsOfInterest(legs, 0);

    expect(result.previousLeg).toBeUndefined();
    expect(result.currentLeg).toBeUndefined();
    expect(result.nextLeg).toBe(legs[0]);
  });
});

describe('matchLegEnds', () => {
  it('closes a gap opened by a transit leg finishing early when a leg precedes it', () => {
    // walk0 -> transit1 (originally contiguous at 10 min) -> walk2
    const legs = [
      { transitLeg: false, mode: 'WALK', start: at(0), end: at(5 * 60000) },
      {
        transitLeg: true,
        mode: 'BUS',
        start: at(5 * 60000),
        end: at(10 * 60000),
      },
      {
        transitLeg: false,
        mode: 'WALK',
        start: at(10 * 60000),
        end: at(15 * 60000),
      },
    ];
    // Real-time update: the bus actually finishes 3 min earlier than planned.
    legs[1].end = at(7 * 60000);

    matchLegEnds(legs);

    // walk2 is pulled back to stay contiguous with the bus's new end time.
    expect(legTime(legs[2].start)).toBe(7 * 60000);
    const { currentLeg, nextLeg } = getLegsOfInterest(legs, 8 * 60000);
    expect(currentLeg).toBe(legs[2]);
    expect(nextLeg).toBeUndefined();
  });

  it("also closes the gap when the early-finishing transit leg is the itinerary's very first leg", () => {
    // transit0 (no leading leg) -> walk1, originally contiguous at 10 min.
    const legs = [
      {
        transitLeg: true,
        mode: 'BUS',
        start: at(0),
        end: at(10 * 60000),
      },
      {
        transitLeg: false,
        mode: 'WALK',
        start: at(10 * 60000),
        end: at(15 * 60000),
      },
    ];
    // Same real-time update: the bus finishes 3 min earlier than planned.
    legs[0].end = at(7 * 60000);

    matchLegEnds(legs);

    // Regression test: nextTransitIndex(legs, 0) returns 0 here, which used
    // to be misread as the "no transit leg found" sentinel (-1) in
    // matchLegEnds's post-transit loop, leaving walk1.start stale and
    // opening a gap where no leg covered "now".
    expect(legTime(legs[1].start)).toBe(7 * 60000);
    const { currentLeg, nextLeg } = getLegsOfInterest(legs, 8 * 60000);
    expect(currentLeg).toBe(legs[1]);
    expect(nextLeg).toBeUndefined();
  });

  it('compresses (but never overlaps) a transfer whose walk time no longer fits between a late arrival and a fixed next departure', () => {
    // transitA (delayed, arrives 3 min late) -> walk transfer (originally a
    // 3 min walk) -> transitB, whose own departure time is fixed/unmovable.
    const legs = [
      {
        transitLeg: true,
        mode: 'BUS',
        start: at(0),
        end: at(10 * 60000),
      },
      {
        transitLeg: false,
        mode: 'WALK',
        start: at(10 * 60000),
        end: at(13 * 60000),
      },
      {
        transitLeg: true,
        mode: 'TRAM',
        start: at(15 * 60000),
        end: at(20 * 60000),
      },
    ];
    // Real-time update: transitA now arrives at 13 min instead of 10.
    legs[0].end = at(13 * 60000);

    matchLegEnds(legs);

    // The transfer is pulled to start right when transitA now arrives...
    expect(legTime(legs[1].start)).toBe(13 * 60000);
    // ...and compressed (3 min -> 2 min) so it ends exactly when transitB
    // departs, instead of overlapping into transitB's (fixed) start time.
    expect(legTime(legs[1].end)).toBe(15 * 60000);
    expect(legTime(legs[1].end)).toBeLessThanOrEqual(legTime(legs[2].start));
    // transitB itself is untouched - its departure is not shiftable.
    expect(legTime(legs[2].start)).toBe(15 * 60000);
    expect(legTime(legs[2].end)).toBe(20 * 60000);
  });
});
