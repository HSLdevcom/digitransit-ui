import groupSkippedStops from '../../../app/component/routepage/groupSkippedStops';

const stop = id => ({ gtfsId: id });
const st = (id, realtimeState) => ({ stop: stop(id), realtimeState });
const scheduled = ['a', 'b', 'c', 'd', 'e'].map(stop);

describe('groupSkippedStops', () => {
  it('returns plain rows when nothing is modified', () => {
    const items = groupSkippedStops(
      scheduled.map(s => st(s.gtfsId, 'UPDATED')),
      scheduled,
    );
    expect(items.every(item => !item.skipped)).toBe(true);
    expect(items).toHaveLength(5);
  });

  it('groups a detour of canceled, missing and added stops into one row', () => {
    const items = groupSkippedStops(
      [
        st('a', 'UPDATED'),
        st('b', 'CANCELED'),
        st('x', 'ADDED'),
        st('c', 'CANCELED'),
        st('y', 'ADDED'),
        st('e', 'UPDATED'),
      ],
      scheduled,
    );
    const skipped = items.filter(item => item.skipped);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].skipped.map(s => s.gtfsId)).toEqual(['b', 'c', 'd']);
    // the group comes before the added stops
    expect(items.indexOf(skipped[0])).toBeLessThan(
      items.findIndex(item => item.stoptime?.stop.gtfsId === 'x'),
    );
    expect(items.filter(item => item.stoptime && !item.skipped)).toHaveLength(4);
  });

  it('keeps a group of canceled stops at the end of the trip', () => {
    const items = groupSkippedStops(
      [st('a', 'UPDATED'), st('b', 'UPDATED'), st('c', 'CANCELED'), st('d', 'CANCELED')],
      scheduled.slice(0, 4),
    );
    const skipped = items.filter(item => item.skipped);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].skipped.map(s => s.gtfsId)).toEqual(['c', 'd']);
    expect(skipped[0].stoptime).toBeDefined();
    expect(items.filter(item => item.stoptime)).toHaveLength(3);
  });

  it('does not group when every stop is canceled', () => {
    const items = groupSkippedStops(
      scheduled.map(s => st(s.gtfsId, 'CANCELED')),
      scheduled,
    );
    expect(items.some(item => item.skipped)).toBe(false);
  });
});
