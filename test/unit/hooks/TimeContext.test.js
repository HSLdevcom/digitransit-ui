import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import sinon from 'sinon';
import { act } from 'react-dom/test-utils';
import {
  TimeProvider,
  useCurrentTime,
  withCurrentTime,
  TWICE_PER_MINUTE,
} from '../../../app/hooks/TimeContext';

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
  let clock;

  afterEach(() => {
    if (unmount) {
      unmount();
      unmount = null;
    }
    if (clock) {
      clock.restore();
      clock = null;
    }
  });

  describe('TimeProvider', () => {
    it('provides the current unix time in seconds', () => {
      const now = Date.parse('2024-05-01T12:00:00Z');
      clock = sinon.useFakeTimers(now);
      const result = render(
        <TimeProvider>
          <TimeConsumer />
        </TimeProvider>,
      );
      unmount = result.unmount;
      expect(result.container.firstChild.dataset.currentTime).to.equal(
        String(Math.floor(now / 1000)),
      );
    });

    it('refreshes the current time every 30 seconds', () => {
      const start = Date.parse('2024-05-01T12:00:00Z');
      clock = sinon.useFakeTimers(start);
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
        clock.tick(TWICE_PER_MINUTE);
      });

      expect(result.container.firstChild.dataset.currentTime).to.equal(
        String(initialTime + TWICE_PER_MINUTE / 1000),
      );
    });

    it('does not update the time before the interval elapses', () => {
      const start = Date.parse('2024-05-01T12:00:00Z');
      clock = sinon.useFakeTimers(start);
      const result = render(
        <TimeProvider>
          <TimeConsumer />
        </TimeProvider>,
      );
      unmount = result.unmount;
      const initialTime = result.container.firstChild.dataset.currentTime;

      act(() => {
        clock.tick(TWICE_PER_MINUTE - 1000);
      });

      expect(result.container.firstChild.dataset.currentTime).to.equal(
        initialTime,
      );
    });
  });

  describe('useCurrentTime outside provider', () => {
    it('throws when used outside a TimeProvider', () => {
      expect(() => render(<OutsideConsumer />)).to.throw(
        'useCurrentTime must be used within a TimeProvider',
      );
    });
  });

  describe('withCurrentTime', () => {
    it('injects currentTime as a prop', () => {
      const now = Date.parse('2024-05-01T12:00:00Z');
      clock = sinon.useFakeTimers(now);
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
      expect(result.container.firstChild.dataset.currentTime).to.equal(
        String(Math.floor(now / 1000)),
      );
    });
  });
});
