import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import withBreakpoint, {
  getClientBreakpoint,
  getServerBreakpoint,
  BreakpointProvider,
  DesktopOrMobile,
} from './src/index.js';

describe('Testing @digitransit-component/digitransit-component-with-breakpoint module', () => {
  const originalInnerWidth = window.innerWidth;
  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  describe('getClientBreakpoint()', () => {
    it('returns "small" below 400px', () => {
      window.innerWidth = 399;
      expect(getClientBreakpoint()).toBe('small');
    });

    it('returns "medium" between 400 and 899px', () => {
      window.innerWidth = 600;
      expect(getClientBreakpoint()).toBe('medium');
    });

    it('returns "large" at 900px and above', () => {
      window.innerWidth = 900;
      expect(getClientBreakpoint()).toBe('large');
    });
  });

  describe('getServerBreakpoint(userAgent)', () => {
    it('returns "small" for a mobile user agent', () => {
      expect(
        getServerBreakpoint(
          'Mozilla/5.0 (Linux; Android 10) Mobile Safari/537.36',
        ),
      ).toBe('small');
    });

    it('returns "large" for a desktop user agent', () => {
      expect(
        getServerBreakpoint(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Safari/537.36',
        ),
      ).toBe('large');
    });

    it('returns "large" when no user agent is given', () => {
      expect(getServerBreakpoint(undefined)).toBe('large');
    });
  });

  describe('withBreakpoint(Component)', () => {
    it('passes the breakpoint from context as a prop', () => {
      // eslint-disable-next-line react/prop-types
      function Probe({ breakpoint }) {
        return <span data-testid="probe">{breakpoint}</span>;
      }
      const WrappedProbe = withBreakpoint(Probe);
      render(
        <BreakpointProvider value="medium">
          <WrappedProbe />
        </BreakpointProvider>,
      );
      expect(screen.getByTestId('probe').textContent).toBe('medium');
    });
  });

  describe('DesktopOrMobile', () => {
    it('renders the desktop render prop when breakpoint is large', () => {
      render(
        <BreakpointProvider value="large">
          <DesktopOrMobile
            desktop={() => <span>desktop-view</span>}
            mobile={() => <span>mobile-view</span>}
          />
        </BreakpointProvider>,
      );
      expect(screen.getByText('desktop-view')).toBeTruthy();
      expect(screen.queryByText('mobile-view')).toBeNull();
    });

    it('renders the mobile render prop when breakpoint is small', () => {
      render(
        <BreakpointProvider value="small">
          <DesktopOrMobile
            desktop={() => <span>desktop-view</span>}
            mobile={() => <span>mobile-view</span>}
          />
        </BreakpointProvider>,
      );
      expect(screen.getByText('mobile-view')).toBeTruthy();
      expect(screen.queryByText('desktop-view')).toBeNull();
    });
  });
});
