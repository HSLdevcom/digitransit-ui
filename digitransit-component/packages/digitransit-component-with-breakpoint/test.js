/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import React from 'react';
import { render, screen } from '@testing-library/react';
import WithBreakpointModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically (see
// digitransit-component-icon/test.js for the equivalent note). Only the
// default export (withBreakpoint) needs unwrapping; the rest are named.
const {
  getClientBreakpoint,
  getServerBreakpoint,
  BreakpointProvider,
  DesktopOrMobile,
} = WithBreakpointModule;
const withBreakpoint = WithBreakpointModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

describe('Testing @digitransit-component/digitransit-component-with-breakpoint module', () => {
  const originalInnerWidth = window.innerWidth;
  afterEach(() => {
    window.innerWidth = originalInnerWidth;
  });

  describe('getClientBreakpoint()', () => {
    it('returns "small" below 400px', () => {
      window.innerWidth = 399;
      expect(getClientBreakpoint()).to.equal('small');
    });

    it('returns "medium" between 400 and 899px', () => {
      window.innerWidth = 600;
      expect(getClientBreakpoint()).to.equal('medium');
    });

    it('returns "large" at 900px and above', () => {
      window.innerWidth = 900;
      expect(getClientBreakpoint()).to.equal('large');
    });
  });

  describe('getServerBreakpoint(userAgent)', () => {
    it('returns "small" for a mobile user agent', () => {
      expect(
        getServerBreakpoint(
          'Mozilla/5.0 (Linux; Android 10) Mobile Safari/537.36',
        ),
      ).to.equal('small');
    });

    it('returns "large" for a desktop user agent', () => {
      expect(
        getServerBreakpoint(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Safari/537.36',
        ),
      ).to.equal('large');
    });

    it('returns "large" when no user agent is given', () => {
      expect(getServerBreakpoint(undefined)).to.equal('large');
    });
  });

  describe('withBreakpoint(Component)', () => {
    it('passes the breakpoint from context as a prop', () => {
      function Probe({ breakpoint }) {
        return h('span', { 'data-testid': 'probe' }, breakpoint);
      }
      const WrappedProbe = withBreakpoint(Probe);
      render(h(BreakpointProvider, { value: 'medium' }, h(WrappedProbe)));
      expect(screen.getByTestId('probe').textContent).to.equal('medium');
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
      expect(screen.getByText('desktop-view')).to.exist;
      expect(screen.queryByText('mobile-view')).to.equal(null);
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
      expect(screen.getByText('mobile-view')).to.exist;
      expect(screen.queryByText('desktop-view')).to.equal(null);
    });
  });
});
