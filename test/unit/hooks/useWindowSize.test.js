import { renderHook } from '@testing-library/react-hooks/dom';
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
  global.window.dispatchEvent(resizeEvent);
};

describe('useWindowSize()', () => {
  it('should return browser window size', () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).to.equal(1024);
    expect(result.current.height).to.equal(768);
    expect(result.current.outer.width).to.equal(1024);
    expect(result.current.outer.height).to.equal(768);
  });

  it('should update on resize event', () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).to.equal(1024, 'initial width');
    resize(500, 768);
    expect(result.current.width).to.equal(500, 'width after resize');
  });
});
