import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TrafficNowLink from './src/index.js';

describe('Testing @digitransit-component/digitransit-component-traffic-now-link module', () => {
  it('renders as a button with an href link', () => {
    render(
      <TrafficNowLink
        lang="en"
        href="https://example.invalid/traffic"
        handleClick={() => {}}
      />,
    );
    expect(screen.getByRole('button')).toBeTruthy();
    expect(screen.getByRole('link').href).toBe(
      'https://example.invalid/traffic',
    );
  });

  it('calls handleClick with the event and language on click', () => {
    const calls = [];
    render(
      <TrafficNowLink lang="sv" handleClick={(e, lang) => calls.push(lang)} />,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(calls).toEqual(['sv']);
  });

  it('calls handleClick on Enter and Space key presses, but not other keys', () => {
    const calls = [];
    render(
      <TrafficNowLink lang="fi" handleClick={(e, lang) => calls.push(lang)} />,
    );
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { keyCode: 13 });
    fireEvent.keyDown(button, { keyCode: 32 });
    fireEvent.keyDown(button, { keyCode: 27 });
    expect(calls).toEqual(['fi', 'fi']);
  });
});
