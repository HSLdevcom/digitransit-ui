import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render, act } from '@testing-library/react';
import { useRealtimeLegs } from '../../../../../../app/component/itinerary/navigator/hooks/useRealtimeLegs';
import { ItineraryContextProvider } from '../../../../../../app/component/itinerary/context/ItineraryContext';
import { setLatestNavigatorItinerary } from '../../../../../../utils/client/localStorage';
import { epochToIso } from '../../../../../../utils/client/timeUtils';

const NOW = Date.parse('2024-05-01T12:00:00Z');

// A single, non-transit leg is enough here: it needs no relay/GraphQL
// round-trip (useQueryRealtimeLegs only queries transit legs), so the
// interval's dispatch is driven purely by the polling logic under test.
function buildLegs() {
  const t = ms => ({ scheduledTime: epochToIso(ms) });
  return [
    {
      mode: 'WALK',
      transitLeg: false,
      start: t(NOW + 5 * 60000),
      end: t(NOW + 10 * 60000),
    },
  ];
}

// Exposes the hook's return value via a ref, since this hook renders no DOM.
const Probe = ({ vehicles, controlRef }) => {
  const legs = useRealtimeLegs({}, null, vehicles, false);
  useEffect(() => {
    const ref = controlRef;
    ref.current = legs;
  });
  return null;
};

Probe.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  vehicles: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  controlRef: PropTypes.object.isRequired,
};

describe('useRealtimeLegs', () => {
  let unmount;

  beforeEach(() => {
    setLatestNavigatorItinerary({
      itinerary: { legs: buildLegs() },
      params: { origin: { lat: 60.1699, lon: 24.9384 }, updatedAt: NOW },
    });
  });

  afterEach(() => {
    if (unmount) {
      unmount();
      unmount = null;
    }
    vi.useRealTimers();
  });

  it('polls for real-time legs once every 10s', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    // kept stable across re-renders, unlike a literal passed inline
    const stableVehicles = {};
    const controlRef = { current: null };

    const result = render(
      <ItineraryContextProvider>
        <Probe vehicles={stableVehicles} controlRef={controlRef} />
      </ItineraryContextProvider>,
    );
    unmount = result.unmount;

    const initialFirstLeg = controlRef.current.firstLeg;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9000);
    });
    // not yet at the 10s mark
    expect(controlRef.current.firstLeg).toBe(initialFirstLeg);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    // processLegs clones every leg on each successful poll, so a new
    // (equal-content) object reference means the interval fired.
    expect(controlRef.current.firstLeg).not.toBe(initialFirstLeg);
  });

  it('does not tear down and recreate its polling interval just because the vehicles object identity changes', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const controlRef = { current: null };

    const result = render(
      <ItineraryContextProvider>
        <Probe vehicles={{}} controlRef={controlRef} />
      </ItineraryContextProvider>,
    );
    unmount = result.unmount;

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    // Simulate a steady stream of real-time vehicle position updates (as
    // would arrive over MQTT), each producing a brand new `vehicles`
    // object reference - this alone should never affect the poll timer.
    for (let i = 1; i <= 5; i += 1) {
      act(() => {
        result.rerender(
          <ItineraryContextProvider>
            <Probe
              vehicles={{ [`v${i}`]: { id: `v${i}` } }}
              controlRef={controlRef}
            />
          </ItineraryContextProvider>,
        );
      });
    }

    // The 10s poll must be a stable heartbeat: re-renders caused purely by
    // vehicles object identity changes must not tear it down and recreate
    // it, or real-time leg refreshes get delayed well past 10s.
    expect(clearIntervalSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });
});

describe('useRealtimeLegs startItinerary', () => {
  let unmount;

  afterEach(() => {
    if (unmount) {
      unmount();
      unmount = null;
    }
  });

  function renderProbe() {
    const controlRef = { current: null };
    const result = render(
      <ItineraryContextProvider>
        <Probe vehicles={{}} controlRef={controlRef} />
      </ItineraryContextProvider>,
    );
    unmount = result.unmount;
    return controlRef;
  }

  it('marks a transit-first leg as force-started instead of rewriting its time', () => {
    setLatestNavigatorItinerary({
      itinerary: {
        legs: [
          {
            legId: 'transit-1',
            mode: 'BUS',
            transitLeg: true,
            start: { scheduledTime: epochToIso(NOW + 5 * 60000) },
            end: { scheduledTime: epochToIso(NOW + 10 * 60000) },
          },
        ],
      },
      params: { origin: { lat: 60.1699, lon: 24.9384 }, updatedAt: NOW },
    });
    const controlRef = renderProbe();

    act(() => {
      controlRef.current.startItinerary(NOW);
    });

    expect(controlRef.current.firstLeg.forceStart).toBe(true);
    // the scheduled start time itself is left untouched for a transit leg.
    expect(controlRef.current.firstLeg.start.scheduledTime).toBe(
      epochToIso(NOW + 5 * 60000),
    );
  });

  it('does nothing when the given start time is not earlier than the planned start', () => {
    setLatestNavigatorItinerary({
      itinerary: { legs: buildLegs() },
      params: { origin: { lat: 60.1699, lon: 24.9384 }, updatedAt: NOW },
    });
    const controlRef = renderProbe();
    const originalStart = controlRef.current.firstLeg.start.scheduledTime;

    act(() => {
      controlRef.current.startItinerary(NOW + 30 * 60000);
    });

    expect(controlRef.current.firstLeg.start.scheduledTime).toBe(originalStart);
  });
});
