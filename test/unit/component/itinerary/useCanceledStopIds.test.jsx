import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import useCanceledStopIds from '../../../../app/component/itinerary/useCanceledStopIds';
import TestProviders from '../../helpers/mock-providers';
import { mockContext } from '../../helpers/mock-context';
import { relayMock } from '../../helpers/mock-relay';

const timeZone = 'Europe/Helsinki';
const wrapper = ({ children }) => (
  <TestProviders config={{ ...mockContext.config, timeZone }}>
    {children}
  </TestProviders>
);

const response = stoptimes => ({ trip: { stoptimesForDate: stoptimes } });

const serviceDay = date =>
  DateTime.fromFormat(date, 'yyyyLLdd', { zone: timeZone }).toSeconds();

const stoptimes = date => [
  {
    realtimeState: 'CANCELED',
    serviceDay: serviceDay(date),
    stop: { gtfsId: 'HSL:1' },
  },
  {
    realtimeState: 'SCHEDULED',
    serviceDay: serviceDay(date),
    stop: { gtfsId: 'HSL:2' },
  },
];

const leg = (loadedDate, serviceDate) => ({
  trip: { gtfsId: 'HSL:trip', stoptimesForDate: stoptimes(loadedDate) },
  serviceDate,
});

describe('useCanceledStopIds', () => {
  beforeEach(() => {
    relayMock.fetch(null, response([]));
  });

  it('uses the loaded stoptimes without a query when they are for the service date of the leg', () => {
    const legs = [leg('20261023', '20261023')];
    const { result } = renderHook(() => useCanceledStopIds(legs), { wrapper });
    expect([...result.current]).toEqual(['HSL:1']);
    expect(relayMock.fetchCalls).toHaveLength(0);
  });

  it('queries the service date of the leg when the loaded stoptimes are for another day', async () => {
    relayMock.fetch(
      null,
      response([
        {
          realtimeState: 'CANCELED',
          stop: { gtfsId: 'HSL:3' },
        },
      ]),
    );
    const legs = [leg('20261023', '20261024')];
    const { result } = renderHook(() => useCanceledStopIds(legs), { wrapper });
    await waitFor(() => expect(result.current.has('HSL:3')).toBe(true));
    expect(result.current.has('HSL:1')).toBe(false);
    expect(relayMock.fetchCalls.map(call => call.variables)).toEqual([
      { tripId: 'HSL:trip', serviceDate: '20261024' },
    ]);
  });

  it('queries the service date of the leg when no stoptimes were loaded', async () => {
    relayMock.fetch(
      null,
      response([{ realtimeState: 'CANCELED', stop: { gtfsId: 'HSL:3' } }]),
    );
    const legs = [
      {
        trip: { gtfsId: 'HSL:trip', stoptimesForDate: [] },
        serviceDate: '20261024',
      },
    ];
    const { result } = renderHook(() => useCanceledStopIds(legs), { wrapper });
    await waitFor(() => expect(result.current.has('HSL:3')).toBe(true));
  });

  it('does not refetch when the stop chain is toggled', async () => {
    relayMock.fetch(
      null,
      response([{ realtimeState: 'CANCELED', stop: { gtfsId: 'HSL:3' } }]),
    );
    const legs = [leg('20261023', '20261024')];
    const { result, rerender } = renderHook(
      ({ enabled }) => useCanceledStopIds(legs, enabled),
      { wrapper, initialProps: { enabled: true } },
    );
    await waitFor(() => expect(result.current.has('HSL:3')).toBe(true));
    rerender({ enabled: false });
    rerender({ enabled: true });
    expect(result.current.has('HSL:3')).toBe(true);
    expect(relayMock.fetchCalls).toHaveLength(1);
  });

  it('does not query when disabled or the leg has no service date', () => {
    const legs = [leg('20261023', '20261024')];
    const { result } = renderHook(() => useCanceledStopIds(legs, false), {
      wrapper,
    });
    renderHook(
      () =>
        useCanceledStopIds([
          { trip: { gtfsId: 'HSL:trip', stoptimesForDate: [] } },
        ]),
      { wrapper },
    );
    expect(relayMock.fetchCalls).toHaveLength(0);
    expect(result.current.size).toBe(0);
  });
});
