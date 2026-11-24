import { render } from '@testing-library/react';
import useOverflowDetection from '../../../../../src/client/component/itinerary/useOverflowDetection';

const Probe = () => {
  const { overflowRef, showOverflowIcon } = useOverflowDetection();
  return <div ref={overflowRef} className={showOverflowIcon ? 'overflow-icon' : ''} />;
};

describe('useOverflowDetection', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('flags overflow only when the content exceeds the container', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    const scrollWidth = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get');

    scrollWidth.mockReturnValue(101);
    expect(render(<Probe />).container.firstElementChild.className).toBe('overflow-icon');

    scrollWidth.mockReturnValue(100);
    expect(render(<Probe />).container.firstElementChild.className).toBe('');
  });
});
