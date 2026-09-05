import { describe, it, expect, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import withBreakpoint, {
  getClientBreakpoint,
  getServerBreakpoint,
  BreakpointProvider,
  DesktopOrMobile,
} from './src/index.js';

// test.js still doesn't use literal JSX (kept as a mechanical migration from
// Mocha, not a redesign) - use React.createElement directly instead.
const h = React.createElement;

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
      function Probe({ breakpoint }) {
        return h('span', { 'data-testid': 'probe' }, breakpoint);
      }
      const WrappedProbe = withBreakpoint(Probe);
      render(h(BreakpointProvider, { value: 'medium' }, h(WrappedProbe)));
      expect(screen.getByTestId('probe').textContent).toBe('medium');
    });
  });

  describe('DesktopOrMobile', () => {
    it('renders the desktop render prop when breakpoint is large', () => {
      render(
        h(
          BreakpointProvider,
          { value: 'large' },
          h(DesktopOrMobile, {
            desktop: () => h('span', null, 'desktop-view'),
            mobile: () => h('span', null, 'mobile-view'),
          }),
        ),
      );
      expect(screen.getByText('desktop-view')).toBeTruthy();
      expect(screen.queryByText('mobile-view')).toBeNull();
    });

    it('renders the mobile render prop when breakpoint is small', () => {
      render(
        h(
          BreakpointProvider,
          { value: 'small' },
          h(DesktopOrMobile, {
            desktop: () => h('span', null, 'desktop-view'),
            mobile: () => h('span', null, 'mobile-view'),
          }),
        ),
      );
      expect(screen.getByText('mobile-view')).toBeTruthy();
      expect(screen.queryByText('desktop-view')).toBeNull();
    });
  });
});
