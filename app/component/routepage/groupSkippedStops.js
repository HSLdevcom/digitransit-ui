/**
 * Compares the stoptimes of a (possibly modified) trip to the scheduled stops
 * and returns the rows of a stop list, in order. A detour is a run of
 * CANCELED / ADDED stoptimes and scheduled stops missing from the trip. It
 * becomes one skipped row, followed by the added stops:
 * - { skipped: [stops], stoptime, index } - the skipped stops of a detour;
 *   stoptime and index belong to the first stoptime of the detour
 * - { stoptime, index, scheduledIndex } - a stop of the trip; scheduledIndex is
 *   undefined for stops added by a realtime update
 * - { scheduledIndex } - a scheduled stop that is not part of the trip but is
 *   not inside a detour either, so it can not be shown as skipped
 */
export default function groupSkippedStops(stoptimes, scheduledStops) {
  const items = [];
  let pending = [];
  let served = false;
  let j = 0;
  // a trip with only canceled stops is shown as ordinary rows
  const anyServed = stoptimes.some(st => st.realtimeState !== 'CANCELED');

  const flush = (next, nextIndex) => {
    if (pending.some(p => p.stop)) {
      // a trailing group falls back to the last stoptime so it always has one
      const last = stoptimes.length - 1;
      const first = pending.find(p => p.stoptime) ||
        (next && { stoptime: next, index: nextIndex }) || {
          stoptime: stoptimes[last],
          index: last,
        };
      items.push({
        skipped: pending.filter(p => p.stop).map(p => p.stop),
        stoptime: first.stoptime,
        index: first.index,
      });
    }
    pending
      .filter(p => !p.stop)
      .forEach(({ stoptime, index, scheduledIndex }) =>
        items.push({ stoptime, index, scheduledIndex }),
      );
    pending = [];
  };

  stoptimes.forEach((stoptime, index) => {
    const { realtimeState } = stoptime;
    let scheduledIndex;
    if (realtimeState !== 'ADDED') {
      const k = scheduledStops.findIndex((s, n) => n >= j && s.gtfsId === stoptime.stop.gtfsId);
      if (k >= 0) {
        scheduledIndex = k;
        for (let n = j; n < k; n += 1) {
          if (served || pending.length > 0) {
            pending.push({ stop: scheduledStops[n] });
          } else {
            items.push({ scheduledIndex: n });
          }
        }
        j = k + 1;
      }
    }
    if (realtimeState === 'ADDED' && (served || anyServed)) {
      pending.push({ stoptime, index });
    } else if (realtimeState === 'CANCELED' && anyServed) {
      pending.push({ stop: stoptime.stop, stoptime, index, scheduledIndex });
    } else {
      flush(stoptime, index);
      items.push({ stoptime, index, scheduledIndex });
      served = true;
    }
  });

  flush();
  for (let n = j; n < scheduledStops.length; n += 1) {
    items.push({ scheduledIndex: n });
  }
  return items;
}
