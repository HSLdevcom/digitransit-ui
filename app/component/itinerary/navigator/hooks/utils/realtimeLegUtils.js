import { legTime } from '../../../../../util/legUtils';
import { epochToIso } from '../../../../../util/timeUtils';
import { DESTINATION_RADIUS, legTraversal } from '../../NaviUtils';

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
    // try moving legs back in time if transit is early,
    // or forward in time if itinerary has not started yet
    if (gap < 0 || !legs[0].freezeStart) {
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
    if (leg.transitLeg) {
      leg.start = {
        ...leg.start,
        estimated: {
          ...leg.start.estimated,
          time: epochToIso(legTime(leg.start) + gap),
          delay: gap,
        },
      };
    } else {
      leg.start.scheduledTime = epochToIso(legTime(leg.start) + gap);
    }
  }
  if (!leg.freezeEnd) {
    if (leg.transitLeg) {
      leg.end = {
        ...leg.end,
        estimated: {
          ...leg.end.estimated,
          time: epochToIso(legTime(leg.end) + gap),
          delay: gap,
        },
      };
    } else {
      leg.end.scheduledTime = epochToIso(legTime(leg.end) + gap);
    }
    // leg.realtimeState = 'UPDATED';
  }
}

function getVehiclePosition(leg, origin, vehicles) {
  const shortName = leg?.route?.shortName;
  const vehicle = Object.values(vehicles).find(v => v.shortName === shortName);
  if (vehicle) {
    return { lat: vehicle.lat, lon: vehicle.long };
  }
  return null;
}

const CONFIRM_UNKNOWN = 0; // falsy
const CONFIRM_YES = 1;
const CONFIRM_NO = 2;

function getRadius(leg) {
  if (leg.mode === 'RAIL' || leg.mode === 'SUBWAY') {
    return 10 * DESTINATION_RADIUS;
  }
  return DESTINATION_RADIUS;
}

// TODO:
// - maybe long vehicles should return UNKNOWN, train may have been
//   stopped quite a while until its position passes the stop position
// - possibly remember two last positions and use speed as well
// - start / end stations could have greater distance thresholds
// - see if mqtt unsubscribe needs some delay
function confirmEnd(leg, origin, pos) {
  if (pos) {
    const tail = legTraversal(leg, origin, pos);
    if (tail) {
      return tail.metersToGo < getRadius(leg) ? CONFIRM_YES : CONFIRM_NO;
    }
  }
  return CONFIRM_UNKNOWN;
}

// Start is easier to confirm, because vehicle pos does not disappear
// because of mqtt unsubscribe at leg end
function confirmStart(leg, origin, pos) {
  if (pos) {
    const head = legTraversal(leg, origin, pos);
    if (head) {
      return head.metersToGo < leg.distance - getRadius(leg)
        ? CONFIRM_YES
        : CONFIRM_NO;
    }
  }
  return CONFIRM_UNKNOWN;
}

const BOARD_DELAY = 20000; // 20s, default delay for card change in transit board/alight

// Adjust unfrozen leg start and end times by vehicle and traveler position
// Logic is not too complicated but some edge cases are problematic:
// Position of a long train may never reach end of the leg geometry in
// the middle of a long platform of an ending rail
// Apparently we should consider if the leg ends at an end stop
// also geolocation certainty plays important role
function shiftLegsByGeolocation(legs, time, vehicles, position, origin) {
  const { previousLeg, currentLeg, nextLeg } = getLegsOfInterest(legs, time);
  let confirm;

  if (previousLeg && !previousLeg.freezeEnd) {
    if (previousLeg.transitLeg) {
      // Make sure prev leg has really ended
      const vPos = getVehiclePosition(previousLeg, origin, vehicles);
      // check more reliable vehicle position first
      // if it is unknown use geolocation
      confirm =
        confirmEnd(previousLeg, origin, vPos) ||
        confirmEnd(previousLeg, origin, position);
    } else {
      // also confirm that walk has ended
      confirm = confirmEnd(previousLeg, origin, position);
    }
    if (confirm === CONFIRM_NO) {
      // extend 5 sec to future
      // eslint-disable-next-line
      console.log(`${previousLeg.mode} not ended, move end time to future`);
      shiftLeg(previousLeg, time - legTime(previousLeg.end) + 5000);
    }
  }

  if (currentLeg && !currentLeg.freezeStart) {
    // curr leg is just starting
    if (currentLeg.transitLeg) {
      // Make sure curr leg has really started.
      const vPos = getVehiclePosition(currentLeg, origin, vehicles);
      confirm =
        confirmStart(currentLeg, origin, vPos) ||
        confirmStart(currentLeg, origin, position);
      if (confirm === CONFIRM_NO) {
        // eslint-disable-next-line
        console.log(
          `${currentLeg.mode} not started, move start time to future`,
        );
        shiftLeg(currentLeg, time - legTime(currentLeg.start) + 5000);
      }
    }
  } else if (currentLeg && !currentLeg.freezeEnd) {
    // start already frozen, check if leg ended early
    if (currentLeg.transitLeg) {
      const vPos = getVehiclePosition(currentLeg, origin, vehicles);
      confirm =
        confirmEnd(currentLeg, origin, vPos) ||
        confirmEnd(currentLeg, origin, position);
    } else {
      confirm = confirmEnd(currentLeg, origin, position);
    }
    if (confirm === CONFIRM_YES) {
      let gap = time - legTime(currentLeg.end);
      if (currentLeg.transitLeg) {
        // finish transit leg after a decent time, not immediately
        // transit might have just arrived and traveller is still boarded
        gap += BOARD_DELAY;
      }
      // eslint-disable-next-line
      console.log(`${currentLeg.mode} ended, set earlier end time`);
      shiftLeg(currentLeg, gap);
      currentLeg.freezeEnd = true; // no more shifting
    }
  }

  if (nextLeg?.transitLeg) {
    // has next leg alreally started?
    const vPos = getVehiclePosition(nextLeg, origin, vehicles);
    confirm =
      confirmStart(nextLeg, origin, vPos) ||
      confirmStart(nextLeg, origin, position);
    if (confirm === CONFIRM_YES) {
      // start immediately
      // eslint-disable-next-line
      console.log(`${nextLeg.mode} started, set start time to now`);
      shiftLeg(nextLeg, time - legTime(nextLeg.start) - 1000);
    }
  }
}

function fakeDelay(legs, counter) {
  const leg = legs.find(tl => tl.transitLeg);
  switch (Math.floor(counter / 2)) {
    case 1:
      shiftLeg(leg, 90000);
      break;
    case 2:
      shiftLeg(leg, 180000);
      break;
    case 3:
      shiftLeg(leg, 300000);
      break;
    case 4:
      shiftLeg(leg, 180000);
      break;
    case 5:
      shiftLeg(leg, 90000);
      break;
    default:
      break;
  }
}

export {
  fakeDelay,
  getLegsOfInterest,
  matchLegEnds,
  nextTransitIndex,
  shiftLeg,
  shiftLegs,
  shiftLegsByGeolocation,
};
