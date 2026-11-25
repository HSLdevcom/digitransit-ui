import distance from '@digitransit-search-util/digitransit-search-util-distance';

/**
 * Finds the geometry index nearest to each stop, so that the indices never decrease.
 */
function getStopIndices(points, stops) {
  let from = 0;
  return stops.map(stop => {
    let best = from;
    let bestDistance = Infinity;
    for (let i = from; i < points.length; i++) {
      const d = distance(points[i], stop);
      if (d < bestDistance) {
        bestDistance = d;
        best = i;
      }
    }
    from = best;
    return best;
  });
}

/**
 * Returns inclusive [start, end] index ranges of points on both sides of canceled stops,
 * like the dotted line next to a canceled stop in the trip stop list.
 * @param {Array} points line geometry
 * @param {Array} stops scheduled stops of the pattern, in order
 * @param {Set<number>} canceledIndices indices of the canceled stops
 */
export function getSkippedRanges(points, stops, canceledIndices) {
  if (!canceledIndices.size || points.length < 2) {
    return [];
  }
  const indices = getStopIndices(points, stops);
  const ranges = [];
  stops.forEach((_, i) => {
    if (canceledIndices.has(i)) {
      const range = [indices[Math.max(i - 1, 0)], indices[Math.min(i + 1, stops.length - 1)]];
      const prev = ranges[ranges.length - 1];
      if (prev && range[0] <= prev[1]) {
        prev[1] = Math.max(prev[1], range[1]);
      } else {
        ranges.push(range);
      }
    }
  });
  return ranges;
}

/**
 * Cuts points into consecutive solid and dashed parts. Neighbouring parts share a point.
 * @param {Array} points line points
 * @param {Array} ranges inclusive dashed index ranges, relative to the full geometry
 * @param {number} offset geometry index of the first point
 * @returns {Array<{points: Array, dashed: boolean}>}
 */
export function splitByRanges(points, ranges, offset = 0) {
  const last = points.length - 1;
  const clipped = ranges
    .map(([start, end]) => [Math.max(start - offset, 0), Math.min(end - offset, last)])
    .filter(([start, end]) => end > start);
  const segments = [];
  let pos = 0;
  clipped.forEach(([start, end]) => {
    if (start > pos) {
      segments.push({ points: points.slice(pos, start + 1), dashed: false });
    }
    segments.push({ points: points.slice(start, end + 1), dashed: true });
    pos = end;
  });
  if (pos < last || segments.length === 0) {
    segments.push({ points: points.slice(pos), dashed: false });
  }
  return segments;
}
