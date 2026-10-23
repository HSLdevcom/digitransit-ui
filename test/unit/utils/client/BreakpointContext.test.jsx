import React from 'react';
import { renderToString } from 'react-dom/server';
import PropTypes from 'prop-types';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  BreakpointContext,
  BreakpointProvider,
  DesktopOrMobile,
  getClientBreakpoint,
  useBreakpoint,
} from '../../../../utils/client/BreakpointContext';

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
    vi.unstubAllGlobals();
    cleanup();
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

  it('skips browser lifecycle work without window', () => {
    vi.stubGlobal('window', undefined);
    const provider = new BreakpointProvider({ children: null });
    provider.setState = vi.fn();

    provider.componentDidMount();
    provider.componentWillUnmount();

    expect(provider.setState).not.toHaveBeenCalled();
  });

  it('skips listener removal when mounting returned before assigning a listener', () => {
    const removeEventListener = vi.fn();
    vi.stubGlobal('window', undefined);
    const provider = new BreakpointProvider({ children: null });

    provider.componentDidMount();
    vi.stubGlobal('window', { removeEventListener });
    provider.componentWillUnmount();

    expect(removeEventListener).not.toHaveBeenCalled();
  });

  it('reads the viewport once per throttled update', () => {
    vi.useFakeTimers();
    const readWidth = vi.fn(() => 399);
    vi.stubGlobal('window', {
      get innerWidth() {
        return readWidth();
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    const provider = new BreakpointProvider({ children: null });
    provider.setState = vi.fn(update => update({ breakpoint: 'large' }));
    readWidth.mockClear();

    provider.componentDidMount();

    expect(readWidth).toHaveBeenCalledTimes(1);
    expect(provider.setState.mock.results[0].value).toEqual({
      breakpoint: 'small',
    });
    provider.componentWillUnmount();
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
    const ref = React.createRef();
    const { unmount } = render(
      <BreakpointProvider ref={ref}>
        <BreakpointLabel />
      </BreakpointProvider>,
    );
    const setState = vi.spyOn(ref.current, 'setState');

    window.innerWidth = 399;
    fireEvent(window, new Event('resize'));
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(setState).not.toHaveBeenCalled();
    setState.mockRestore();
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
