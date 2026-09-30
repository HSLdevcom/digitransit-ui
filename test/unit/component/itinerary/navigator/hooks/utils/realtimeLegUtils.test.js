import {
  getLegsOfInterest,
  matchLegEnds,
} from '../../../../../../../app/component/itinerary/navigator/hooks/utils/realtimeLegUtils';
import { legTime } from '../../../../../../../utils/client/legUtils';

const at = ms => ({ scheduledTime: new Date(ms).toISOString() });

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
});
