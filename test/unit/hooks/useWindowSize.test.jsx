import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { render, act } from '@testing-library/react';
import useWindowSize from '../../../app/hooks/useWindowSize';

/**
 * Mock JSDOM window resize (explicitly set innerWidth and innerHeight
 * and dispatch event.
 *
 * @param {Number} width
 * @param {Number} height
 */
const resize = (width, height) => {
  global.window.innerWidth = width || global.window.innerWidth;
  global.window.innerHeight = height || global.window.innerHeight;
  const resizeEvent = new window.Event('resize', { bubbles: true });
  act(() => {
    global.window.dispatchEvent(resizeEvent);
  });
};

/**
 * A test consumer component that exposes the hook's return value via a ref
 * so tests can inspect it without reading implementation internals.
 */
const SizeConsumer = ({ controlRef = null }) => {
  const size = useWindowSize();

  useEffect(() => {
    if (controlRef) {
      const ref = controlRef;
      ref.current = size;
    }
  });

  return <div />;
};

SizeConsumer.propTypes = {
  controlRef: PropTypes.shape({ current: PropTypes.object }),
};

describe('useWindowSize()', () => {
  it('should return browser window size', () => {
    const controlRef = { current: null };
    render(<SizeConsumer controlRef={controlRef} />);
    expect(controlRef.current.width).toBe(1024);
    expect(controlRef.current.height).toBe(768);
    expect(controlRef.current.outer.width).toBe(1024);
    expect(controlRef.current.outer.height).toBe(768);
  });

  it('should update on resize event', () => {
    const controlRef = { current: null };
    render(<SizeConsumer controlRef={controlRef} />);
    expect(controlRef.current.width).toBe(1024);
    resize(500, 768);
    expect(controlRef.current.width).toBe(500);
  });
});
