import React from 'react';
import { act } from '@testing-library/react';
import * as found from 'found';
import { renderWithProviders } from '../../../helpers/mock-providers';
import NaviCardContainer from '../../../../../app/component/itinerary/navigator/NaviCardContainer';

const NOW = Date.parse('2024-05-01T12:00:00Z');
const t = ms => ({ scheduledTime: new Date(ms).toISOString() });
// transit leg times need `estimated` too - getTransitLegState reads it
// directly (no optional chaining) once realtimeState is 'UPDATED'.
const tr = ms => ({
  scheduledTime: new Date(ms).toISOString(),
  estimated: { time: new Date(ms).toISOString(), delay: 0 },
});

const config = {
  CONFIG: 'test',
  colors: { bus: '#007ac9', primary: '#000000' },
  feedIds: [],
  zones: {},
  language: 'en',
};

const settings = { minTransferTime: 3 * 60000 };

// A simple, 3-leg journey: walk to a stop, ride a bus, walk to
// the destination with a 2 min wait gap before boarding.
function buildLegs() {
  return [
    {
      legId: 'leg-walk-1',
      mode: 'WALK',
      transitLeg: false,
      distance: 300,
      start: t(NOW),
      end: t(NOW + 2 * 60000),
      from: { name: 'Home' },
      to: { name: 'Bus stop' },
    },
    {
      legId: 'leg-transit-1',
      mode: 'BUS',
      transitLeg: true,
      realtimeState: 'UPDATED',
      alerts: [],
      distance: 4000,
      route: { shortName: '55', mode: 'BUS', color: '007ac9' },
      trip: { tripHeadsign: 'Keskusta' },
      start: tr(NOW + 4 * 60000),
      end: tr(NOW + 12 * 60000),
      from: {
        name: 'Bus stop',
        stop: { name: 'Bus stop', parentStation: null, vehicleMode: 'BUS' },
      },
      to: {
        name: 'Center stop',
        stop: { name: 'Center stop', vehicleMode: 'BUS' },
      },
    },
    {
      legId: 'leg-walk-2',
      mode: 'WALK',
      transitLeg: false,
      distance: 200,
      start: t(NOW + 12 * 60000),
      end: t(NOW + 15 * 60000),
      from: { name: 'Center stop' },
      to: { name: 'Destination' },
    },
  ];
}

const baseProps = legs => ({
  focusToPoint: () => {},
  legs,
  position: null,
  tailLength: 100,
  containerTopPosition: 0,
  isJourneyCompleted: false,
  settings,
});

describe('<NaviCardContainer />', () => {
  let router;

  beforeEach(() => {
    router = { push: vi.fn() };
    vi.spyOn(found, 'useRouter').mockReturnValue({
      router,
      match: { params: { to: 'Destination' } },
    });
  });

  const getCard = container => container.querySelector('.navi-top-card');

  it('renders visible, non-blank card content for every phase of a normal journey', () => {
    const legs = buildLegs();
    const [walk1, transit, walk2] = legs;

    const renderPhase = props =>
      renderWithProviders(
        <NaviCardContainer {...baseProps(legs)} {...props} />,
        { config },
      );

    // Phase 1: walking to the stop, bus is the next leg.
    const { container, rerender } = renderPhase({
      time: NOW + 1 * 60000,
      currentLeg: walk1,
      nextLeg: transit,
      firstLeg: walk1,
      lastLeg: walk2,
      previousLeg: undefined,
    });
    expect(getCard(container)).toBeTruthy();
    expect(container.textContent.trim()).not.toBe('');
    expect(container.textContent).toContain('55');

    // Phase 2: waiting at the stop for the bus (real gap, no current leg).
    rerender(
      <NaviCardContainer
        {...baseProps(legs)}
        time={NOW + 3 * 60000}
        currentLeg={undefined}
        nextLeg={transit}
        firstLeg={walk1}
        lastLeg={walk2}
        previousLeg={walk1}
      />,
    );
    expect(getCard(container)).toBeTruthy();
    expect(container.textContent.trim()).not.toBe('');
    expect(container.textContent).toContain('55');

    // Phase 3: riding the bus.
    rerender(
      <NaviCardContainer
        {...baseProps(legs)}
        time={NOW + 6 * 60000}
        currentLeg={transit}
        nextLeg={walk2}
        firstLeg={walk1}
        lastLeg={walk2}
        previousLeg={walk1}
      />,
    );
    expect(getCard(container)).toBeTruthy();
    expect(container.textContent.trim()).not.toBe('');
    expect(container.textContent).toContain('55');

    // Phase 4: walking to the destination, journey almost done.
    rerender(
      <NaviCardContainer
        {...baseProps(legs)}
        time={NOW + 13 * 60000}
        currentLeg={walk2}
        nextLeg={undefined}
        firstLeg={walk1}
        lastLeg={walk2}
        previousLeg={transit}
      />,
    );
    expect(getCard(container)).toBeTruthy();
    expect(container.textContent.trim()).not.toBe('');
  });

  describe('leg-change transition timing', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('keeps the outgoing leg visible for the full hide window, with no premature flash', () => {
      const legs = buildLegs();
      const [walk1, transit] = legs;

      const { container, rerender } = renderWithProviders(
        <NaviCardContainer
          {...baseProps(legs)}
          time={NOW + 1 * 60000}
          currentLeg={walk1}
          nextLeg={transit}
          firstLeg={walk1}
          lastLeg={legs[2]}
          previousLeg={undefined}
        />,
        { config },
      );

      const cardContainer = () =>
        container.querySelector('.navi-card-container');
      expect(cardContainer().className).toContain('show-card');

      // Current leg changes (walk1 -> gap): must hide immediately...
      act(() => {
        rerender(
          <NaviCardContainer
            {...baseProps(legs)}
            time={NOW + 3 * 60000}
            currentLeg={undefined}
            nextLeg={transit}
            firstLeg={walk1}
            lastLeg={legs[2]}
            previousLeg={walk1}
          />,
        );
      });
      expect(cardContainer().className).toContain('hide-card');

      // ...and stay hidden for the whole HIDE_TOPCARD_DURATION (2000ms):
      // not a moment less, or the new card flashes in too early.
      act(() => {
        vi.advanceTimersByTime(1999);
      });
      expect(cardContainer().className).toContain('hide-card');

      // once the window elapses, it must actually show again (not stay
      // stuck hidden forever).
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(cardContainer().className).toContain('show-card');
    });

    it('still shows the card again when a time update arrives during the hide window', () => {
      const legs = buildLegs();
      const [walk1, transit] = legs;
      const props = {
        ...baseProps(legs),
        nextLeg: transit,
        firstLeg: walk1,
        lastLeg: legs[2],
      };

      const { container, rerender } = renderWithProviders(
        <NaviCardContainer
          {...props}
          time={NOW + 1 * 60000}
          currentLeg={walk1}
          previousLeg={undefined}
        />,
        { config },
      );
      const cardContainer = () =>
        container.querySelector('.navi-card-container');

      act(() => {
        rerender(
          <NaviCardContainer
            {...props}
            time={NOW + 3 * 60000}
            currentLeg={undefined}
            previousLeg={walk1}
          />,
        );
      });
      expect(cardContainer().className).toContain('hide-card');

      // a realtime poll lands while the hide timeout is pending; it must not
      // cancel the timeout and leave the card hidden forever
      act(() => {
        vi.advanceTimersByTime(500);
        rerender(
          <NaviCardContainer
            {...props}
            time={NOW + 3 * 60000 + 500}
            currentLeg={undefined}
            previousLeg={walk1}
          />,
        );
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(cardContainer().className).toContain('show-card');
    });

    it('ends up showing the latest leg, not a stale one, when legs change faster than the hide window', () => {
      const legs = buildLegs();
      const [walk1, transit, walk2] = legs;

      const { container, rerender } = renderWithProviders(
        <NaviCardContainer
          {...baseProps(legs)}
          time={NOW + 1 * 60000}
          currentLeg={walk1}
          nextLeg={transit}
          firstLeg={walk1}
          lastLeg={walk2}
          previousLeg={undefined}
        />,
        { config },
      );

      // Simulate a delayed real-time poll catching up all at once: the
      // wait, the bus ride, and boarding the final walk leg all land
      // within a single HIDE_TOPCARD_DURATION window.
      act(() => {
        rerender(
          <NaviCardContainer
            {...baseProps(legs)}
            time={NOW + 3 * 60000}
            currentLeg={undefined}
            nextLeg={transit}
            firstLeg={walk1}
            lastLeg={walk2}
            previousLeg={walk1}
          />,
        );
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      act(() => {
        rerender(
          <NaviCardContainer
            {...baseProps(legs)}
            time={NOW + 13 * 60000}
            currentLeg={walk2}
            nextLeg={undefined}
            firstLeg={walk1}
            lastLeg={walk2}
            previousLeg={transit}
          />,
        );
      });

      // Whatever happens during the hidden window, once everything
      // settles the card must show the truly-current leg (walk2), not
      // something stuck from an intermediate state.
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      const cardContainer = container.querySelector('.navi-card-container');
      expect(cardContainer.className).toContain('show-card');
      expect(container.textContent.trim()).not.toBe('');
      expect(container.textContent).toContain('Destination');
    });
  });
});
