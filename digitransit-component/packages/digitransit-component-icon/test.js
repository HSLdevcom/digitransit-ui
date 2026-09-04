/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render } from '@testing-library/react';
import IconModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const Icon = IconModule.default;

// test.js runs as plain native ESM (no Babel at test time, per design - see
// docs/WorkspacePackages.md), so JSX isn't available here: use
// React.createElement directly instead.
const h = React.createElement;

describe('Testing @digitransit-component/digitransit-component-icon module', () => {
  it('renders the svg for a known icon key', () => {
    const { container } = render(h(Icon, { img: 'close' }));
    expect(container.querySelector('svg')).to.exist;
  });

  it('falls back to the default (bus-stop-digitransit) icon for an unknown key', () => {
    const fallback = render(h(Icon, { img: 'bus-stop-digitransit' }));
    const unknown = render(h(Icon, { img: 'not-a-real-icon' }));
    expect(unknown.container.innerHTML).to.equal(fallback.container.innerHTML);
  });

  it('applies color, size and rotation as inline style', () => {
    const { container } = render(
      h(Icon, {
        img: 'close',
        color: '#ff0000',
        height: 2,
        width: 1.5,
        rotate: 90,
      }),
    );
    const svg = container.querySelector('svg');
    expect(svg.style.fill).to.equal('#ff0000');
    expect(svg.style.height).to.equal('2em');
    expect(svg.style.width).to.equal('1.5em');
    expect(svg.style.transform).to.equal('rotate(90deg)');
  });
});
