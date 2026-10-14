import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render, act } from '@testing-library/react';
import useProcessLegs from '../../../../../../app/component/itinerary/navigator/hooks/useProcessLegs';
import { legTime } from '../../../../../../utils/client/legUtils';

const NOW = Date.parse('2024-05-01T12:00:00Z');
const at = ms => ({ scheduledTime: new Date(ms).toISOString() });

function buildLeg(overrides = {}) {
  return {
    legId: 'leg-1',
    mode: 'WALK',
    transitLeg: false,
    start: at(NOW),
    end: at(NOW + 5 * 60000),
    to: { name: 'Destination' },
    ...overrides,
  };
}

// Exposes the hook's processLegs function via a ref, since hooks can only be
// called from inside a component.
function Probe({ simulateTransferProblem, controlRef }) {
  const processLegs = useProcessLegs(simulateTransferProblem, null, {}, null);
  useEffect(() => {
    const ref = controlRef;
    ref.current = processLegs;
  });
  return null;
}

Probe.propTypes = {
  simulateTransferProblem: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  controlRef: PropTypes.object.isRequired,
};

Probe.defaultProps = {
  simulateTransferProblem: false,
};

function getProcessLegs(simulateTransferProblem = false) {
  const controlRef = { current: null };
  render(
    <Probe
      simulateTransferProblem={simulateTransferProblem}
      controlRef={controlRef}
    />,
  );
  return controlRef;
}

describe('useProcessLegs', () => {
  it('merges matching real-time data onto a leg by legId', () => {
    const controlRef = getProcessLegs();
    const leg = buildLeg();
    const rtLegMap = {
      'leg-1': {
        realtimeState: 'UPDATED',
        start: at(NOW + 60000),
        end: at(NOW + 6 * 60000),
        to: { vehicleRentalStation: { stationId: 'x' } },
      },
    };

    const [processed] = controlRef.current([leg], rtLegMap, NOW);

    expect(processed.realtimeState).toBe('UPDATED');
    expect(processed.start.scheduledTime).toBe(
      rtLegMap['leg-1'].start.scheduledTime,
    );
    expect(processed.to.vehicleRentalStation).toEqual({ stationId: 'x' });
    // fields not present in the rt payload must still come from the original leg.
    expect(processed.to.name).toBe('Destination');
  });

  it('leaves a leg untouched when there is no matching real-time data', () => {
    const controlRef = getProcessLegs();
    const leg = buildLeg();

    const [processed] = controlRef.current([leg], {}, NOW);

    expect(processed.start.scheduledTime).toBe(leg.start.scheduledTime);
    expect(processed).not.toBe(leg); // still a deep clone, not the same reference
  });

  it('leaves a leg untouched when it has no legId to match against', () => {
    const controlRef = getProcessLegs();
    const leg = buildLeg({ legId: undefined });
    const rtLegMap = { undefined: { start: at(NOW + 60000) } };

    const [processed] = controlRef.current([leg], rtLegMap, NOW);

    expect(processed.start.scheduledTime).toBe(leg.start.scheduledTime);
  });

  it('drops the real-time start time when the leg start is already frozen', () => {
    const controlRef = getProcessLegs();
    const leg = buildLeg({ freezeStart: true });
    const rtLegMap = {
      'leg-1': {
        start: at(NOW + 60000),
        end: at(NOW + 6 * 60000),
        to: {},
      },
    };

    const [processed] = controlRef.current([leg], rtLegMap, NOW);

    // freezeStart must survive the merge and the original start time kept,
    // even though the real-time payload tried to move it.
    expect(processed.freezeStart).toBe(true);
    expect(processed.start.scheduledTime).toBe(leg.start.scheduledTime);
  });

  it('freezes a leg once its (possibly just-shifted) start/end has passed', () => {
    const controlRef = getProcessLegs();
    const legs = [
      buildLeg({ legId: 'past', start: at(NOW - 60000), end: at(NOW - 1000) }),
      buildLeg({
        legId: 'future',
        start: at(NOW + 60000),
        end: at(NOW + 5 * 60000),
      }),
    ];

    const [past, future] = controlRef.current(legs, {}, NOW);

    expect(past.freezeStart).toBe(true);
    expect(past.freezeEnd).toBe(true);
    expect(future.freezeStart).toBe(false);
    expect(future.freezeEnd).toBe(false);
  });

  it('applies simulated transfer-problem delays only when enabled, advancing on every call', () => {
    const controlRef = getProcessLegs(true);
    const legs = [
      buildLeg({
        legId: 'transit',
        transitLeg: true,
        start: at(NOW),
        end: at(NOW + 5 * 60000),
      }),
    ];
    const originalEnd = legTime(legs[0].end);

    // fakeDelay's internal counter starts at 0; Math.floor(counter/2) === 0
    // (counters 0 and 1) is a no-op, so the first two calls must not shift
    // anything.
    const [firstCall] = controlRef.current(legs, {}, NOW);
    expect(legTime(firstCall.end)).toBe(originalEnd);

    act(() => {
      controlRef.current(legs, {}, NOW);
    });
    // third call uses counter 2 -> Math.floor(2/2) === 1 -> +90s delay.
    const [thirdCall] = controlRef.current(legs, {}, NOW);

    expect(legTime(thirdCall.end)).toBe(originalEnd + 90000);
  });

  it('does not mutate the input legs array (always works on a deep clone)', () => {
    const controlRef = getProcessLegs();
    const leg = buildLeg();
    const originalStart = leg.start.scheduledTime;
    const rtLegMap = {
      'leg-1': { start: at(NOW + 60000), end: at(NOW + 6 * 60000), to: {} },
    };

    controlRef.current([leg], rtLegMap, NOW);

    expect(leg.start.scheduledTime).toBe(originalStart);
  });
});
