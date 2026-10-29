import { describe, it, expect } from 'vitest';
import {
  getDepartureHeadsigns,
  getDepartureStoptimes,
} from '../../../app/component/stop/timetableUtils';

const st = (headsign, pickupType, gtfsId = 'X:1') => ({
  headsign,
  pickupType,
  stop: { gtfsId },
});

describe('timetableUtils', () => {
  const pattern = {
    headsign: 'Kauppatori',
    stops: [{ gtfsId: 'X:1' }, { gtfsId: 'X:2' }],
  };

  it('leaves out drop-off-only times and arrivals to the last stop', () => {
    const times = [
      st('A', 'SCHEDULED'),
      st('B', 'NONE'),
      st('C', 'SCHEDULED', 'X:2'),
    ];
    expect(getDepartureStoptimes({ pattern, stoptimes: times })).toEqual([
      times[0],
    ]);
  });

  it('lists distinct stop time headsigns, falling back to the pattern', () => {
    const times = [
      st('Lattomeri', 'SCHEDULED'),
      st('Kauppatori', 'SCHEDULED'),
      st('Lattomeri', 'SCHEDULED'),
      st(undefined, 'SCHEDULED'),
    ];
    expect(getDepartureHeadsigns({ pattern, stoptimes: times })).toEqual([
      'Lattomeri',
      'Kauppatori',
    ]);
  });
});
