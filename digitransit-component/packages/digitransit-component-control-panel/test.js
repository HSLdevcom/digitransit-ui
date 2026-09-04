/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen } from '@testing-library/react';
import CtrlPanelModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically. Some
// components are wrapped (React.memo/forwardRef), so this checks presence
// rather than a specific type.
const CtrlPanel = CtrlPanelModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

describe('Testing @digitransit-component/digitransit-component-control-panel module', () => {
  it('exports SeparatorLine and NearStopsAndRoutes as static members', () => {
    expect(CtrlPanel.SeparatorLine).to.be.a('function');
    expect(CtrlPanel.NearStopsAndRoutes).to.be.a('function');
  });

  it('renders children inside a positioned container', () => {
    render(h(CtrlPanel, { position: 'left' }, h('div', null, 'panel-child')));
    expect(screen.getByText('panel-child')).to.exist;
  });

  describe('NearStopsAndRoutes', () => {
    it('renders a near-you button for each requested, valid mode', () => {
      render(
        h(
          CtrlPanel,
          { position: 'left' },
          h(CtrlPanel.NearStopsAndRoutes, {
            appElement: '#app',
            modeArray: ['bus', 'tram', 'not-a-real-mode'],
            language: 'en',
            origin: {},
            onClick: () => {},
            urlPrefix: '/nearyou',
          }),
        ),
      );
      expect(screen.getAllByRole('link')).to.have.lengthOf(2);
    });

    it('navigates to the mode-specific URL, including origin coordinates, on click', () => {
      const clicks = [];
      render(
        h(
          CtrlPanel,
          { position: 'left' },
          h(CtrlPanel.NearStopsAndRoutes, {
            appElement: '#app',
            modeArray: ['bus'],
            language: 'en',
            origin: { address: 'Pasila', lat: 60.2, lon: 24.9 },
            onClick: url => clicks.push(url),
            urlPrefix: '/nearyou',
          }),
        ),
      );
      screen.getByRole('link').click();
      expect(clicks).to.deep.equal(['/en/nearyou/BUS/POS/Pasila::60.2,24.9']);
    });
  });
});
