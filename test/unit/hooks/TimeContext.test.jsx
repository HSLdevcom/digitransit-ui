import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import {
  TimeProvider,
  useCurrentTime,
  withCurrentTime,
  TWICE_PER_MINUTE,
} from '../../../app/hooks/TimeContext';

// React's dev-mode error logging re-dispatches a render error a second time,
// asynchronously, via a simulated DOM event (`invokeGuardedCallbackDev`,
// used to capture a better stack trace) - in addition to the synchronous
// throw the test itself catches with `expect(() => render(...)).toThrow()`.
// jsdom reports that second, event-dispatch-based throw as an uncaught
// script error, which fires a `window` `error` event; Vitest's jsdom
// environment re-emits that as a Node `uncaughtException` if no other
// listener is registered on `window` - printed as a top-level "Error:
// Uncaught [...]" that has nothing to do with `console.error` (so mocking/
// restoring `console.error` around the render call below doesn't silence
// it). Registering our own `error` listener that calls
// `event.preventDefault()` (mirroring what a real page would do) stops it.
const suppressUncaughtError = callback => {
  const onError = event => event.preventDefault();
  window.addEventListener('error', onError);
  try {
    callback();
  } finally {
    window.removeEventListener('error', onError);
  }
};

/**
 * A test consumer component that exposes the current time via a ref so
 * tests can inspect it without reading implementation internals.
 */
const TimeConsumer = ({ controlRef }) => {
  const currentTime = useCurrentTime();

  useEffect(() => {
    if (controlRef) {
      const ref = controlRef;
      ref.current = currentTime;
    }
  });

  return <div data-current-time={currentTime} />;
};

TimeConsumer.propTypes = {
  controlRef: PropTypes.shape({ current: PropTypes.number }),
};

/**
 * A component that deliberately uses useCurrentTime outside a provider to
 * verify that the hook throws.
 */
const OutsideConsumer = () => {
  useCurrentTime();
  return <div />;
};

describe('TimeContext', () => {
  let unmount;

  afterEach(() => {
    if (unmount) {
      unmount();
      unmount = null;
    }
    vi.useRealTimers();
  });

  describe('TimeProvider', () => {
    it('provides the current unix time in seconds', () => {
      const now = Date.parse('2024-05-01T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const result = render(
        <TimeProvider>
          <TimeConsumer />
        </TimeProvider>,
      );
      unmount = result.unmount;
      expect(result.container.firstChild.dataset.currentTime).toBe(
        String(Math.floor(now / 1000)),
      );
    });

    it('refreshes the current time every 30 seconds', () => {
      const start = Date.parse('2024-05-01T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(start);
      const result = render(
        <TimeProvider>
          <TimeConsumer />
        </TimeProvider>,
      );
      unmount = result.unmount;
      const initialTime = Number(
        result.container.firstChild.dataset.currentTime,
      );

      act(() => {
        vi.advanceTimersByTime(TWICE_PER_MINUTE);
      });

      expect(result.container.firstChild.dataset.currentTime).toBe(
        String(initialTime + TWICE_PER_MINUTE / 1000),
      );
    });

    it('does not update the time before the interval elapses', () => {
      const start = Date.parse('2024-05-01T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(start);
      const result = render(
        <TimeProvider>
          <TimeConsumer />
        </TimeProvider>,
      );
      unmount = result.unmount;
      const initialTime = result.container.firstChild.dataset.currentTime;

      act(() => {
        vi.advanceTimersByTime(TWICE_PER_MINUTE - 1000);
      });

      expect(result.container.firstChild.dataset.currentTime).toBe(initialTime);
    });
  });

  describe('useCurrentTime outside provider', () => {
    it('throws when used outside a TimeProvider', () => {
      // React's dev-mode error logging re-reports the render error a second
      // time (asynchronously, via a simulated DOM event) in addition to the
      // synchronous throw below; suppress that duplicate console.error so it
      // doesn't surface as an unhandled exception (the global setup makes
      // console.error throw).
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      suppressUncaughtError(() => {
        expect(() => render(<OutsideConsumer />)).toThrow(
          'useCurrentTime must be used within a TimeProvider',
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('withCurrentTime', () => {
    it('injects currentTime as a prop', () => {
      const now = Date.parse('2024-05-01T12:00:00Z');
      vi.useFakeTimers();
      vi.setSystemTime(now);
      const Inner = props => (
        <div data-current-time={props.currentTime} /> // eslint-disable-line react/prop-types
      );
      const Wrapped = withCurrentTime(Inner);
      const result = render(
        <TimeProvider>
          <Wrapped foo="bar" />
        </TimeProvider>,
      );
      unmount = result.unmount;
      expect(result.container.firstChild.dataset.currentTime).toBe(
        String(Math.floor(now / 1000)),
      );
    });
  });
});
