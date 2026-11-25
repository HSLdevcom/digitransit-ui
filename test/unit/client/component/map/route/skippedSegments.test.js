import {
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
});
