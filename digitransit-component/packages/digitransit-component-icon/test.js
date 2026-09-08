import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import Icon from './src/index.js';

describe('Testing @digitransit-component/digitransit-component-icon module', () => {
  it('renders the svg for a known icon key', () => {
    const { container } = render(<Icon img="close" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('falls back to the default (bus-stop-digitransit) icon for an unknown key', () => {
    const fallback = render(<Icon img="bus-stop-digitransit" />);
    const unknown = render(<Icon img="not-a-real-icon" />);
    expect(unknown.container.innerHTML).toBe(fallback.container.innerHTML);
  });

  it('applies color, size and rotation as inline style', () => {
    const { container } = render(
      <Icon img="close" color="#ff0000" height={2} width={1.5} rotate={90} />,
    );
    const svg = container.querySelector('svg');
    expect(svg.style.fill).toBe('#ff0000');
    expect(svg.style.height).toBe('2em');
    expect(svg.style.width).toBe('1.5em');
    expect(svg.style.transform).toBe('rotate(90deg)');
  });
});
