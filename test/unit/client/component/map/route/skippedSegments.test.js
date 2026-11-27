import {
  getDetourSegments,
  getSkippedRanges,
  splitByRanges,
} from '../../../../../../src/client/component/map/route/skippedSegments';

const points = [0, 1, 2, 3, 4, 5, 6].map(lon => ({ lat: 60, lon: 24 + lon * 0.01 }));
const stops = [0, 2, 4, 6].map((i, n) => ({ gtfsId: `s${n}`, lat: 60, lon: points[i].lon }));

describe('skippedSegments', () => {
  it('finds the geometry on both sides of canceled stops', () => {
    expect(getSkippedRanges(points, stops, new Set([1]))).toEqual([[0, 4]]);
    expect(getSkippedRanges(points, stops, new Set([1, 2]))).toEqual([[0, 6]]);
  });

  it('includes the line next to canceled stops at the ends of the trip', () => {
    expect(getSkippedRanges(points, stops, new Set())).toEqual([]);
    expect(getSkippedRanges(points, stops, new Set([0]))).toEqual([[0, 2]]);
    expect(getSkippedRanges(points, stops, new Set([3]))).toEqual([[4, 6]]);
  });

  it('splits points into solid and dashed segments sharing end points', () => {
    const segments = splitByRanges(points, [[2, 4]]);
    expect(segments.map(s => s.dashed)).toEqual([false, true, false]);
    expect(segments.map(s => s.points.length)).toEqual([3, 3, 3]);
  });

  it('clips ranges to a sub-array', () => {
    const segments = splitByRanges(points.slice(3), [[2, 4]], 3);
    expect(segments.map(s => s.dashed)).toEqual([true, false]);
    expect(segments[0].points).toHaveLength(2);
  });

  it('returns one solid segment when nothing is skipped', () => {
    expect(splitByRanges(points, [])).toEqual([{ points, dashed: false }]);
  });

  it('diverges into a solid and a dashed path along a detour', () => {
    // stops: 0 served, 1 canceled, 2 added, 3 canceled, 4 added, 5 served
    const line = [0, 1, 2, 3, 4, 5].map(i => [60, 24 + i * 0.01]);
    const calls = line.map(([lat, lon], i) => ({ gtfsId: `c${i}`, lat, lon }));
    const segments = getDetourSegments(line, calls, new Set([1, 3]), new Set([2, 4]));
    expect(segments).toEqual([
      { points: [line[0], line[2], line[4]], dashed: false, detour: true },
      { points: [line[0], line[1], line[3], line[4]], dashed: true },
      { points: line.slice(4), dashed: false },
    ]);
  });

  it('keeps the line outside of detours as it is', () => {
    const line = [0, 1, 2, 3, 4, 5].map(i => [60, 24 + i * 0.01]);
    const calls = line.map(([lat, lon], i) => ({ gtfsId: `c${i}`, lat, lon }));
    const segments = getDetourSegments(line, calls, new Set([2]), new Set());
    expect(segments).toEqual([
      { points: line.slice(0, 2), dashed: false },
      { points: [line[1], line[3]], dashed: false },
      { points: [line[1], line[2], line[3]], dashed: true },
      { points: line.slice(3), dashed: false },
    ]);
  });

  it('makes the dashed path follow the scheduled pattern geometry', () => {
    const line = [0, 1, 2, 3, 4].map(i => [60, 24 + i * 0.01]);
    const calls = line.map(([lat, lon], i) => ({ gtfsId: `c${i}`, lat, lon }));
    const pattern = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map(i => [60.001, 24 + i * 0.01]);
    const dashed = getDetourSegments(line, calls, new Set([2]), new Set(), pattern).find(
      segment => segment.dashed,
    );
    expect(dashed.points).toEqual(pattern.slice(2, 7));
  });
});
