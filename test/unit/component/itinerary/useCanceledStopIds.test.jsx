import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import useCanceledStopIds from '../../../../app/component/itinerary/useCanceledStopIds';
import TestProviders from '../../helpers/mock-providers';
import { mockContext } from '../../helpers/mock-context';

const mockFetchQuery = vi.hoisted(() => vi.fn());
vi.mock('react-relay', async importOriginal => {
  const actual = await importOriginal();
  return {
    ReactRelayContext: actual.ReactRelayContext,
    fetchQuery: mockFetchQuery,
  };
});

const timeZone = 'Europe/Helsinki';
const wrapper = ({ children }) => (
  <TestProviders config={{ ...mockContext.config, timeZone }}>
    {children}
  </TestProviders>
);

const response = stoptimes => ({
  toPromise: async () => ({ trip: { stoptimesForDate: stoptimes } }),
});

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
    mockFetchQuery.mockReset();
  });

  it('uses the loaded stoptimes without a query when they are for the service date of the leg', () => {
    const legs = [leg('20261023', '20261023')];
    const { result } = renderHook(() => useCanceledStopIds(legs), { wrapper });
    expect([...result.current]).toEqual(['HSL:1']);
    expect(mockFetchQuery).not.toHaveBeenCalled();
  });

  it('queries the service date of the leg when the loaded stoptimes are for another day', async () => {
    mockFetchQuery.mockReturnValue(
      response([
        {
          realtimeState: 'CANCELED',
          stop: { gtfsId: 'HSL:3' },
        },
      ]),
    );
    const legs = [leg('20261023', '20261024')];
    const { result } = renderHook(() => useCanceledStopIds(legs), { wrapper });
    await waitFor(() => expect(result.current.has('HSL:3')).toBe(true), {
      timeout: 5000,
    });
    expect(result.current.has('HSL:1')).toBe(false);
    expect(mockFetchQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      { tripId: 'HSL:trip', serviceDate: '20261024' },
      expect.anything(),
    );
  });

  it('queries the service date of the leg when no stoptimes were loaded', async () => {
    mockFetchQuery.mockReturnValue(
      response([{ realtimeState: 'CANCELED', stop: { gtfsId: 'HSL:3' } }]),
    );
    const legs = [
      {
        trip: { gtfsId: 'HSL:trip', stoptimesForDate: [] },
        serviceDate: '20261024',
      },
    ];
    const { result } = renderHook(() => useCanceledStopIds(legs), { wrapper });
    await waitFor(() => expect(result.current.has('HSL:3')).toBe(true), {
      timeout: 5000,
    });
  });

  it('does not refetch when the stop chain is toggled', async () => {
    mockFetchQuery.mockReturnValue(
      response([{ realtimeState: 'CANCELED', stop: { gtfsId: 'HSL:3' } }]),
    );
    const legs = [leg('20261023', '20261024')];
    const { result, rerender } = renderHook(
      ({ enabled }) => useCanceledStopIds(legs, enabled),
      { wrapper, initialProps: { enabled: true } },
    );
    await waitFor(() => expect(result.current.has('HSL:3')).toBe(true), {
      timeout: 5000,
    });
    rerender({ enabled: false });
    rerender({ enabled: true });
    expect(result.current.has('HSL:3')).toBe(true);
    expect(mockFetchQuery).toHaveBeenCalledTimes(1);
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
    expect(mockFetchQuery).not.toHaveBeenCalled();
    expect(result.current.size).toBe(0);
  });
});
