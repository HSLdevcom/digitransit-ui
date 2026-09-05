import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import Icon from './src/index.js';

// test.js still doesn't use literal JSX (kept as a mechanical migration from
// Mocha, not a redesign) - use React.createElement directly instead.
const h = React.createElement;

describe('Testing @digitransit-component/digitransit-component-icon module', () => {
  it('renders the svg for a known icon key', () => {
    const { container } = render(h(Icon, { img: 'close' }));
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('falls back to the default (bus-stop-digitransit) icon for an unknown key', () => {
    const fallback = render(h(Icon, { img: 'bus-stop-digitransit' }));
    const unknown = render(h(Icon, { img: 'not-a-real-icon' }));
    expect(unknown.container.innerHTML).toBe(fallback.container.innerHTML);
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
    expect(svg.style.fill).toBe('#ff0000');
    expect(svg.style.height).toBe('2em');
    expect(svg.style.width).toBe('1.5em');
    expect(svg.style.transform).toBe('rotate(90deg)');
  });
});
