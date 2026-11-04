import { renderToString } from 'react-dom/server';
import PropTypes from 'prop-types';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  BreakpointContext,
  BreakpointProvider,
  DesktopOrMobile,
  getClientBreakpoint,
  useBreakpoint,
} from '../../../../app/hooks/BreakpointContext';

function BreakpointLabel({ onRender }) {
  const breakpoint = useBreakpoint();
  onRender?.(breakpoint);
  return <output>{breakpoint}</output>;
}

BreakpointLabel.propTypes = {
  onRender: PropTypes.func,
};

describe('breakpoint context', () => {
  const originalWidth = window.innerWidth;

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllTimers();
    vi.useRealTimers();
    window.innerWidth = originalWidth;
  });

  it.each([
    [0, 'small'],
    [1, 'small'],
    [399, 'small'],
    [400, 'medium'],
    [899, 'medium'],
    [900, 'large'],
    [1200, 'large'],
  ])('maps width %i to %s', (width, breakpoint) => {
    expect(getClientBreakpoint(width)).toBe(breakpoint);
  });

  it('uses the viewport only when width is nullish', () => {
    window.innerWidth = 900;
    expect(getClientBreakpoint()).toBe('large');
    expect(getClientBreakpoint(null)).toBe('large');
    expect(getClientBreakpoint(0)).toBe('small');
  });

  it('supports explicit widths and defaults to large without window', () => {
    vi.stubGlobal('window', undefined);

    expect(getClientBreakpoint()).toBe('large');
    expect(getClientBreakpoint(null)).toBe('large');
    expect(getClientBreakpoint(0)).toBe('small');
    expect(getClientBreakpoint(399)).toBe('small');
    expect(getClientBreakpoint(400)).toBe('medium');
    expect(getClientBreakpoint(900)).toBe('large');
    expect(
      renderToString(
        <BreakpointProvider>
          <BreakpointLabel />
        </BreakpointProvider>,
      ),
    ).toContain('large');
  });

  it('reads the viewport once per throttled update', () => {
    vi.useFakeTimers();
    const readWidth = vi
      .spyOn(window, 'innerWidth', 'get')
      .mockReturnValue(399);
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const { getByText, unmount } = render(
      <BreakpointProvider>
        <BreakpointLabel />
      </BreakpointProvider>,
    );

    expect(getByText('small')).toBeTruthy();
    expect(readWidth).toHaveBeenCalledTimes(2);
    readWidth.mockClear();
    const resizeListener = addEventListener.mock.calls.find(
      ([eventName]) => eventName === 'resize',
    )[1];
    act(() => {
      resizeListener();
      vi.advanceTimersByTime(100);
    });
    expect(readWidth).toHaveBeenCalledTimes(1);
    unmount();
    readWidth.mockRestore();
    addEventListener.mockRestore();
  });

  it('defaults to large without a provider', () => {
    const { getByText } = render(<BreakpointLabel />);
    expect(getByText('large')).toBeTruthy();
  });

  it('reads explicit provider values and responds to changes', () => {
    const { getByText, rerender } = render(
      <BreakpointContext.Provider value="small">
        <BreakpointLabel />
      </BreakpointContext.Provider>,
    );
    expect(getByText('small')).toBeTruthy();

    rerender(
      <BreakpointContext.Provider value="medium">
        <BreakpointLabel />
      </BreakpointContext.Provider>,
    );
    expect(getByText('medium')).toBeTruthy();
  });

  it.each([
    [399, 'small'],
    [400, 'medium'],
    [900, 'large'],
  ])('initializes from viewport width %i', (width, breakpoint) => {
    vi.useFakeTimers();
    window.innerWidth = width;
    const { getByText } = render(
      <BreakpointProvider>
        <BreakpointLabel />
      </BreakpointProvider>,
    );
    expect(getByText(breakpoint)).toBeTruthy();
  });

  it('keeps the state breakpoint when a value prop is supplied', () => {
    vi.useFakeTimers();
    window.innerWidth = 1000;
    const { getByText } = render(
      <BreakpointProvider value="small">
        <BreakpointLabel />
      </BreakpointProvider>,
    );
    expect(getByText('large')).toBeTruthy();

    window.innerWidth = 400;
    fireEvent(window, new Event('resize'));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(getByText('medium')).toBeTruthy();
  });

  it('throttles resize updates and only notifies when the breakpoint changes', () => {
    vi.useFakeTimers();
    window.innerWidth = 1000;
    const onRender = vi.fn();
    const { getByText, unmount } = render(
      <BreakpointProvider>
        <BreakpointLabel onRender={onRender} />
      </BreakpointProvider>,
    );
    onRender.mockClear();

    window.innerWidth = 950;
    fireEvent(window, new Event('resize'));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onRender).not.toHaveBeenCalled();

    window.innerWidth = 899;
    fireEvent(window, new Event('resize'));
    expect(getByText('medium')).toBeTruthy();

    window.innerWidth = 399;
    fireEvent(window, new Event('resize'));
    expect(getByText('medium')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(getByText('small')).toBeTruthy();
    expect(onRender.mock.calls.map(([value]) => value)).toEqual([
      'medium',
      'small',
    ]);

    unmount();
    onRender.mockClear();
    window.innerWidth = 1000;
    fireEvent(window, new Event('resize'));
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onRender).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels a pending trailing resize update on unmount', () => {
    vi.useFakeTimers();
    window.innerWidth = 1000;
    const onRender = vi.fn();
    const { unmount } = render(
      <BreakpointProvider>
        <BreakpointLabel onRender={onRender} />
      </BreakpointProvider>,
    );
    onRender.mockClear();

    window.innerWidth = 399;
    fireEvent(window, new Event('resize'));
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onRender).not.toHaveBeenCalled();
  });

  it.each(['large', 'medium', 'small'])(
    'lazily selects the layout for %s',
    breakpoint => {
      const desktop = vi.fn(() => <div>Desktop</div>);
      const mobile = vi.fn(() => <div>Mobile</div>);
      const { getByText } = render(
        <BreakpointContext.Provider value={breakpoint}>
          <DesktopOrMobile desktop={desktop} mobile={mobile} />
        </BreakpointContext.Provider>,
      );
      expect(
        getByText(breakpoint === 'large' ? 'Desktop' : 'Mobile'),
      ).toBeTruthy();
      expect(desktop).toHaveBeenCalledTimes(breakpoint === 'large' ? 1 : 0);
      expect(mobile).toHaveBeenCalledTimes(breakpoint === 'large' ? 0 : 1);
    },
  );
});
