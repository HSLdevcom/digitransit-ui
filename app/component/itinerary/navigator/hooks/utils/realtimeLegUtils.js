import { legTime } from '../../../../../util/legUtils';
import { epochToIso } from '../../../../../util/timeUtils';
import { getVehiclePosition, validateLeg } from '../../NaviUtils';
/**
 * Finds the index of the next transit leg starting from a given index.
 * @param {Array} legs - Array of legs.
 * @param {number} i - Starting index.
 * @returns {number} Index of the next transit leg or -1 if not found.
 */
function nextTransitIndex(legs, i) {
  for (let j = i; j < legs.length; j++) {
    if (legs[j].transitLeg) {
      return j;
    }
  }
  // negative indicates not found
  return -1;
}

/**
 * Calculates the gap between the end of one leg and the start of the next.
 * @param {Array} legs - Array of legs.
 * @param {number} index - Index of the current leg.
 * @returns {number} Time gap in milliseconds.
 */
function getLegGap(legs, index) {
  return legTime(legs[index + 1].start) - legTime(legs[index].end);
}

/**
 * Shifts the scheduled times of non-transit legs by a given gap.
 * @param {Array} legs - Array of legs.
 * @param {number} i1 - Start index.
 * @param {number} i2 - End index.
 * @param {number} gap - Time gap in milliseconds.
 */
function shiftLegs(legs, i1, i2, gap) {
  for (let j = i1; j <= i2; j++) {
    const leg = legs[j];
    if (!leg.freezeStart) {
      leg.start.scheduledTime = epochToIso(legTime(leg.start) + gap);
    }
    if (!leg.freezeEnd) {
      leg.end.scheduledTime = epochToIso(legTime(leg.end) + gap);
    }
  }
}

/**
 * Scales the scheduled times of non-transit legs by a given factor.
 * @param {Array} legs - Array of legs.
 * @param {number} i1 - Start index.
 * @param {number} i2 - End index.
 * @param {number} k - Scaling factor.
 */
function scaleLegs(legs, i1, i2, k) {
  const base = legTime(legs[i1].start);
  for (let j = i1; j <= i2; j++) {
    const leg = legs[j];
    const s = legTime(leg.start);
    const e = legTime(leg.end);
    if (!leg.freezeStart) {
      leg.start.scheduledTime = epochToIso(base + k * (s - base));
    }
    if (!leg.freezeEnd) {
      leg.end.scheduledTime = epochToIso(base + k * (e - base));
    }
  }
}

/**
 * Matches the ends of legs to ensure continuity in the itinerary.
 * @param {Array} legs - Array of legs.
 */
function matchLegEnds(legs) {
  if (legs.length < 2) {
    return;
  }
  let transit;
  let gap;

  // shift first legs to match transit start
  transit = nextTransitIndex(legs, 0);
  if (transit > 0) {
    gap = getLegGap(legs, transit - 1);
    if (gap) {
      shiftLegs(legs, 0, transit - 1, gap);
    }
  }

  // shift transfers and legs after transit end
  while (transit > 0) {
    const walk = transit + 1; // first leg after transit
    const nextTransit = nextTransitIndex(legs, walk);
    const shiftEnd = nextTransit > 0 ? nextTransit - 1 : legs.length - 1;
    if (shiftEnd > transit) {
      gap = getLegGap(legs, transit);
      if (gap) {
        shiftLegs(legs, walk, shiftEnd, -gap);
      }
    }
    if (nextTransit > walk) {
      // check if transfer needs scaling
      gap = getLegGap(legs, nextTransit - 1);
      if (gap < 0) {
        // transfer overlaps next transit leg, so we must make it shorter
        const transferDuration =
          legTime(legs[shiftEnd].end) - legTime(legs[walk].start);
        scaleLegs(
          legs,
          walk,
          shiftEnd,
          (transferDuration + gap) / transferDuration,
        );
      }
    }
    transit = nextTransit;
  }
}

/**
 * Extracts legs of interest (current, next, previous, etc.) based on the current time.
 * @param {Array} legs - Array of legs.
 * @param {number} now - Current timestamp in milliseconds.
 * @returns {Object} Object containing legs of interest.
 */
function getLegsOfInterest(legs, now) {
  if (!legs?.length) {
    return {
      firstLeg: undefined,
      lastLeg: undefined,
      currentLeg: undefined,
      nextLeg: undefined,
    };
  }
  const currentLeg = legs.find(
    ({ start, end }) => legTime(start) <= now && legTime(end) >= now,
  );

  const nextStart = currentLeg ? legTime(currentLeg.end) : now;
  const nextLeg = legs.find(({ start }) => legTime(start) >= nextStart);
  const previousLeg = legs.findLast(({ end }) => legTime(end) < now);

  return {
    firstLeg: legs[0],
    lastLeg: legs[legs.length - 1],
    previousLeg,
    currentLeg,
    nextLeg,
  };
}

// shift transit leg (for debugging)
function shiftLeg(leg, gap) {
  /* eslint-disable no-param-reassign */
  if (!leg.freezeStart) {
    leg.start = {
      ...leg.start,
      estimated: {
        ...leg.start.estimated,
        time: epochToIso(legTime(leg.start) + gap),
        delay: gap,
      },
    };
  }
  if (!leg.freezeEnd) {
    leg.end = {
      ...leg.end,
      estimated: {
        ...leg.end.estimated,
        time: epochToIso(legTime(leg.end) + gap),
        delay: gap,
      },
    };
    leg.realtimeState = 'UPDATED';
  }
}

/*
const BOARD_DELAY = 20000; // 20s, default delay for card change in transit board/alight
*/

function shiftLegsByGeolocation(legs, time, vehicles, position, origin) {
  const { prev } = getLegsOfInterest(legs, time);

  if (prev && !prev.freezeEnd) {
    if (prev.transitLeg) {
      const vPos = getVehiclePosition(prev, origin, vehicles);
      if (vPos) {
        validateLeg(prev, origin, vPos);
      }
    }
  }
}

export {
  getLegsOfInterest,
  matchLegEnds,
  nextTransitIndex,
  shiftLeg,
  shiftLegs,
  shiftLegsByGeolocation,
};
