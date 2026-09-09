import {
  getInterliningLegs,
  isFirstInterliningLeg,
  isWalkOrBicycleWalkLeg,
  legTime,
} from '../../util/legUtils';

/**
 * Normalises the bar-width percentage for each compressed leg.
 * Handles interlining spans, short-last-leg absorption, wait-time
 * merging, and carry-over from too-short walk legs to the following leg.
 *
 * Returns a ProcessedLeg array. Each entry has shape:
 *   { leg, index, skipped: true }                        — non-first interlining leg
 *   { leg, index, legLength, renderBar, waiting,         — renderable leg
 *     waitTime, waitLength, interliningWithRoute, nextLeg,
 *     skipped: false }
 */
export function normalizeLegLengths(
  compressedLegs,
  { relativeLength, renderBarThreshold, lastLegLength, waitThreshold },
) {
  const { result } = compressedLegs.reduce(
    ({ result: acc, carryOver }, leg, i) => {
      // Non-first interlining legs: their span is covered by the first leg.
      if (leg.interlineWithPreviousLeg) {
        return {
          result: [...acc, { leg, index: i, skipped: true }],
          carryOver,
        };
      }

      const startMs = legTime(leg.start);
      const endMs = legTime(leg.end);
      const nextLeg =
        i < compressedLegs.length - 1 ? compressedLegs[i + 1] : null;

      let legLength = relativeLength(endMs - startMs);
      let waiting = false;
      let waitTime = 0;
      let waitLength = 0;
      let interliningWithRoute;

      if (nextLeg && !leg.to.viaLocationType) {
        // Don't show waiting in intermediate places.
        waitTime = legTime(nextLeg.start) - endMs;
        waitLength = relativeLength(waitTime);
        if (waitTime > waitThreshold && waitLength > renderBarThreshold) {
          // Show waiting as a separate bar if it's long enough.
          waiting = true;
        } else {
          // Otherwise add the wait time to the current leg.
          legLength = relativeLength(endMs - startMs + waitTime);
        }
      }

      if (isFirstInterliningLeg(compressedLegs, i)) {
        const [interliningLines, interliningLegs] = getInterliningLegs(
          compressedLegs,
          i,
        );
        interliningWithRoute = interliningLines.join(' / ');
        const lastLegWithInterline =
          interliningLegs[interliningLegs.length - 1];
        legLength = relativeLength(legTime(lastLegWithInterline.end) - startMs);
        if (
          compressedLegs.length - 2 === i + interliningLegs.length &&
          lastLegLength < renderBarThreshold
        ) {
          // If the last leg is too short, add it to the interlining span.
          legLength += lastLegLength;
        }
      } else if (
        compressedLegs.length - 2 === i &&
        lastLegLength < renderBarThreshold
      ) {
        // If the last leg is too short, add it to the previous leg's span.
        legLength += lastLegLength;
      }

      legLength += carryOver;
      let newCarryOver = 0;
      let renderBar = true;
      if (legLength < renderBarThreshold && isWalkOrBicycleWalkLeg(leg)) {
        // Don't render a bar for too-short walk/bike legs; carry over their length to the next leg.
        renderBar = false;
        newCarryOver = legLength;
      }

      return {
        result: [
          ...acc,
          {
            leg,
            index: i,
            legLength,
            renderBar,
            waiting,
            waitTime,
            waitLength,
            interliningWithRoute,
            nextLeg,
            skipped: false,
          },
        ],
        carryOver: newCarryOver,
      };
    },
    { result: [], carryOver: 0 },
  );

  return result;
}
