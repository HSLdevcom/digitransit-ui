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

const toPoint = ([lat, lon]) => ({ lat, lon });

/**
 * Follows the scheduled pattern geometry between two stops, or returns undefined when that is
 * not possible.
 */
function followPattern(pattern, from, to) {
  if (!pattern?.length) {
    return undefined;
  }
  const [start, end] = getStopIndices(pattern.map(toPoint), [toPoint(from), toPoint(to)]);
  return end > start ? pattern.slice(start, end + 1) : undefined;
}

/**
 * Splits a leg's line where stops are canceled. Along a detour, which is canceled stops possibly
 * with added stops among them, the line diverges: a solid path through the stops still served
 * and a dashed path through the canceled stops, both running from the stop before the detour
 * to the stop after it. The rest of the line stays solid.
 * @param {Array<[number, number]>} points line geometry as [lat, lon]
 * @param {Array} stops stops of the trip, in order
 * @param {Set<number>} canceledIndices indices of the canceled stops
 * @param {Set<number>} addedIndices indices of the stops added by a realtime update
 * @param {Array<[number, number]>} [pattern] scheduled pattern geometry, which the dashed path follows
 * @returns {Array<{points: Array, dashed: boolean, detour?: boolean}>} detour marks the solid
 *   path of a detour that has added stops
 */
export function getDetourSegments(points, stops, canceledIndices, addedIndices, pattern) {
  if (!canceledIndices.size || points.length < 2) {
    return [{ points, dashed: false }];
  }
  const indices = getStopIndices(
    points.map(([lat, lon]) => ({ lat, lon })),
    stops,
  );
  const coord = i => [stops[i].lat, stops[i].lon];
  const last = stops.length - 1;
  const segments = [];
  const push = (pts, dashed, detour = false) => {
    if (pts.length > 1) {
      segments.push(detour ? { points: pts, dashed, detour } : { points: pts, dashed });
    }
  };
  let pos = 0;
  let i = 0;
  while (i <= last) {
    if (!canceledIndices.has(i)) {
      i += 1;
    } else {
      const first = i;
      let lastCanceled = i;
      let k = i + 1;
      while (k <= last && (canceledIndices.has(k) || addedIndices.has(k))) {
        if (canceledIndices.has(k)) {
          lastCanceled = k;
        }
        k += 1;
      }
      const before = first > 0 ? [first - 1] : [];
      const after = lastCanceled < last ? [lastCanceled + 1] : [];
      const detour = Array.from({ length: lastCanceled - first + 1 }, (_, n) => first + n);
      const start = Math.max(first > 0 ? indices[first - 1] : 0, pos);
      const end = Math.max(
        lastCanceled < last ? indices[lastCanceled + 1] : points.length - 1,
        start,
      );
      push(points.slice(pos, start + 1), false);
      push(
        [...before, ...detour.filter(n => !canceledIndices.has(n)), ...after].map(coord),
        false,
        [...detour, ...after].some(n => addedIndices.has(n)),
      );
      const canceledPath = [...before, ...detour.filter(n => canceledIndices.has(n)), ...after].map(
        coord,
      );
      // the stops that the scheduled pattern surely has, around the canceled ones
      let rejoin = lastCanceled + 1;
      while (rejoin <= last && addedIndices.has(rejoin)) {
        rejoin += 1;
      }
      let leave = first - 1;
      while (leave >= 0 && addedIndices.has(leave)) {
        leave -= 1;
      }
      push(
        followPattern(
          pattern,
          coord(leave >= 0 ? leave : first),
          coord(rejoin <= last ? rejoin : lastCanceled),
        ) || canceledPath,
        true,
      );
      pos = end;
      i = lastCanceled + 1;
    }
  }
  push(points.slice(pos), false);
  return segments;
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
