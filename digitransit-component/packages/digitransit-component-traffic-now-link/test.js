/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TrafficNowLinkModule from './lib/index.cjs';

// Node's CJS/ESM interop binds a default import to the whole UMD `exports`
// object, not `.default` - cjs-module-lexer can't see named exports through
// Rollup's UMD factory indirection to unwrap it automatically.
const TrafficNowLink = TrafficNowLinkModule.default;

// test.js runs as plain native ESM (no Babel at test time), so JSX isn't
// available here: use React.createElement directly instead.
const h = React.createElement;

describe('Testing @digitransit-component/digitransit-component-traffic-now-link module', () => {
  it('renders as a button with an href link', () => {
    render(
      h(TrafficNowLink, {
        lang: 'en',
        href: 'https://example.invalid/traffic',
        handleClick: () => {},
      }),
    );
    expect(screen.getByRole('button')).to.exist;
    expect(screen.getByRole('link')).to.have.property(
      'href',
      'https://example.invalid/traffic',
    );
  });

  it('calls handleClick with the event and language on click', () => {
    const calls = [];
    render(
      h(TrafficNowLink, {
        lang: 'sv',
        handleClick: (e, lang) => calls.push(lang),
      }),
    );
    fireEvent.click(screen.getByRole('button'));
    expect(calls).to.deep.equal(['sv']);
  });

  it('calls handleClick on Enter and Space key presses, but not other keys', () => {
    const calls = [];
    render(
      h(TrafficNowLink, {
        lang: 'fi',
        handleClick: (e, lang) => calls.push(lang),
      }),
    );
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { keyCode: 13 });
    fireEvent.keyDown(button, { keyCode: 32 });
    fireEvent.keyDown(button, { keyCode: 27 });
    expect(calls).to.deep.equal(['fi', 'fi']);
  });
});
