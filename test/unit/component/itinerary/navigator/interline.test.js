import { expect } from 'chai';
import cloneDeep from 'lodash/cloneDeep';
import { epochToIso } from '../../../../../utils/client/timeUtils';
import { legTime } from '../../../../../utils/client/legUtils';
import {
  getLegsOfInterest,
  matchLegEnds,
} from '../../../../../app/component/itinerary/navigator/hooks/utils/realtimeLegUtils';

// Real data captured from a live OTP plan query for Mikonkatu -> Kapteeninkatu
// (tram 2 interlines into tram 3 at Olympiaterminaali, ~3 min dwell).
function buildLegs() {
  const t = ms => ({ scheduledTime: epochToIso(ms) });
  return [
    {
      mode: 'WALK',
      transitLeg: false,
      interlineWithPreviousLeg: false,
      start: t(1789725796000),
      end: t(1789725930000),
    },
    {
      mode: 'TRAM',
      transitLeg: true,
      interlineWithPreviousLeg: false,
      legId: 'leg-tram2',
      start: t(1789725930000),
      end: t(1789726215000),
    },
    {
      mode: 'TRAM',
      transitLeg: true,
      interlineWithPreviousLeg: true,
      legId: 'leg-tram3',
      start: t(1789726390000),
      end: t(1789726543000),
    },
    {
      mode: 'WALK',
      transitLeg: false,
      interlineWithPreviousLeg: false,
      start: t(1789726543000),
      end: t(1789726701000),
    },
  ];
}

describe('interline repro (tram 2 -> tram 3)', () => {
  it('finds tram 2 as the current leg while riding it, before matchLegEnds', () => {
    const legs = buildLegs();
    const now = legTime(legs[1].start) + 60000; // 1 min into tram 2's ride
    const { currentLeg, nextLeg } = getLegsOfInterest(legs, now);
    expect(currentLeg?.legId).to.equal('leg-tram2');
    expect(nextLeg?.legId).to.equal('leg-tram3');
  });

  it('finds tram 2 as the current leg while riding it, after matchLegEnds', () => {
    const legs = cloneDeep(buildLegs());
    const now = legTime(legs[1].start) + 60000;
    matchLegEnds(legs, now);
    const { currentLeg, nextLeg } = getLegsOfInterest(legs, now);
    expect(currentLeg?.legId).to.equal('leg-tram2');
    expect(nextLeg?.legId).to.equal('leg-tram3');
  });

  it('has no current leg during the real interline dwell', () => {
    const legs = buildLegs();
    const now = legTime(legs[1].end) + 60000; // inside the ~3 min gap
    const { currentLeg, nextLeg, previousLeg } = getLegsOfInterest(legs, now);
    expect(currentLeg).to.equal(undefined);
    expect(nextLeg?.legId).to.equal('leg-tram3');
    // NaviCardExtension's WAIT_IN_VEHICLE branch reads previousLeg to
    // compare route.shortName against nextLeg during the dwell.
    expect(previousLeg?.legId).to.equal('leg-tram2');
  });
});
