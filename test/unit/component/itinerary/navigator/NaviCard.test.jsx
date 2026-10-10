import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../helpers/mock-providers';
import NaviCard from '../../../../../app/component/itinerary/navigator/NaviCard';
import { LEGTYPE } from '../../../../../app/component/itinerary/navigator/NaviUtils';

const NOW = Date.parse('2024-05-01T12:00:00Z');
const at = ms => ({
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

const baseProps = {
  focusToPoint: () => {},
  previousLeg: undefined,
  time: NOW,
  position: null,
  tailLength: 0,
  cardAnimation: '',
  platformUpdated: false,
};

function renderCard(props) {
  return renderWithProviders(<NaviCard {...baseProps} {...props} />, {
    config,
  });
}

describe('<NaviCard />', () => {
  it('renders nothing for the PENDING leg type', () => {
    const { container } = renderCard({
      legType: LEGTYPE.PENDING,
      leg: undefined,
      nextLeg: undefined,
    });
    expect(container.textContent).toBe('');
  });

  it('renders nothing for the END leg type even if legs are present', () => {
    const { container } = renderCard({
      legType: LEGTYPE.END,
      leg: { mode: 'WALK', to: {} },
      nextLeg: undefined,
    });
    expect(container.textContent).toBe('');
  });

  it('renders nothing when there is neither a current nor a next leg', () => {
    const { container } = renderCard({
      legType: LEGTYPE.WAIT,
      leg: undefined,
      nextLeg: undefined,
    });
    expect(container.textContent).toBe('');
  });

  describe('WAIT leg type icon/instructions fallback', () => {
    it('shows the generic waiting icon when waiting for a transit vehicle', () => {
      const { container } = renderCard({
        legType: LEGTYPE.WAIT,
        leg: undefined,
        nextLeg: {
          mode: 'BUS',
          transitLeg: true,
          route: { shortName: '55', mode: 'BUS' },
          trip: { tripHeadsign: 'Downtown' },
          start: at(NOW + 3 * 60000),
          from: {},
        },
      });
      expect(container.querySelector('.navi-top-card')).toBeTruthy();
      expect(container.textContent).toContain('55');
    });

    it('falls back to walking-style instructions instead of a blank card when the next leg is not transit', () => {
      // Regression test for the "occasional blank cards" fix: a WAIT
      // legType with a non-transit nextLeg (e.g. after real-time
      // re-syncing leaves a gap) must still render something.
      const { container } = renderCard({
        legType: LEGTYPE.WAIT,
        leg: undefined,
        nextLeg: {
          mode: 'WALK',
          transitLeg: false,
          to: { name: 'Home' },
          from: {},
        },
      });
      expect(container.textContent.trim()).not.toBe('');
      expect(container.textContent).toContain('Walk to');
    });
  });

  it('renders transit instructions with the route color/icon for the TRANSIT leg type', () => {
    const { container } = renderCard({
      legType: LEGTYPE.TRANSIT,
      leg: {
        legId: 'transit-1',
        mode: 'BUS',
        transitLeg: true,
        alerts: [],
        route: { shortName: '55', mode: 'BUS', color: '007ac9' },
        trip: { tripHeadsign: 'Keskusta' },
        start: at(NOW),
        end: at(NOW + 8 * 60000),
        from: {
          stop: { name: 'Bus stop', parentStation: null, vehicleMode: 'BUS' },
        },
        to: { stop: { name: 'Center stop', vehicleMode: 'BUS' } },
      },
      nextLeg: undefined,
    });
    expect(container.textContent).toContain('55');
  });

  it('applies the configured fallback color for the transit mode icon', () => {
    const { container } = renderCard({
      legType: LEGTYPE.TRANSIT,
      leg: {
        legId: 'transit-color-check',
        mode: 'BUS',
        transitLeg: true,
        route: { shortName: '55', mode: 'BUS' },
        trip: { tripHeadsign: 'Keskusta' },
        start: at(NOW),
        end: at(NOW + 8 * 60000),
        from: {
          stop: { name: 'Bus stop', parentStation: null, vehicleMode: 'BUS' },
        },
        to: { stop: { name: 'Center stop', vehicleMode: 'BUS' } },
      },
      nextLeg: undefined,
    });
    expect(container.querySelector('.mode')?.style.fill).toBe(
      config.colors.bus,
    );
  });

  it('collapses an expanded card back to the default view once the current leg changes', () => {
    const walkLeg = {
      legId: 'walk-1',
      mode: 'WALK',
      transitLeg: false,
      to: {},
    };
    // Must differ in both legId and mode: isAnyLegPropertyIdentical treats
    // legs sharing even one of ['legId', 'mode'] as "the same leg".
    const bikeLeg = {
      legId: 'bike-1',
      mode: 'BICYCLE',
      transitLeg: false,
      to: {},
    };

    const { container, rerender } = renderCard({
      legType: LEGTYPE.MOVE,
      leg: walkLeg,
      nextLeg: undefined,
    });

    const button = container.querySelector('.navi-top-card');
    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    rerender(
      <NaviCard
        {...baseProps}
        legType={LEGTYPE.MOVE}
        leg={bikeLeg}
        nextLeg={undefined}
      />,
    );

    expect(
      container.querySelector('.navi-top-card').getAttribute('aria-expanded'),
    ).toBe('false');
  });
});
