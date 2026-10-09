import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CtrlPanel from './src/index';

describe('Testing @digitransit-component/digitransit-component-control-panel module', () => {
  it('exports SeparatorLine and NearStopsAndRoutes as static members', () => {
    expect(CtrlPanel.SeparatorLine).toBeTypeOf('function');
    expect(CtrlPanel.NearStopsAndRoutes).toBeTypeOf('function');
  });

  it('renders children inside a positioned container', () => {
    render(
      <CtrlPanel position="left">
        <div>panel-child</div>
      </CtrlPanel>,
    );
    expect(screen.getByText('panel-child')).toBeTruthy();
  });

  describe('NearStopsAndRoutes', () => {
    it('renders a near-you button for each requested, valid mode', () => {
      render(
        <CtrlPanel position="left">
          <CtrlPanel.NearStopsAndRoutes
            modeArray={['bus', 'tram', 'not-a-real-mode']}
            language="en"
            origin={{}}
            onClick={() => {}}
            urlPrefix="/nearyou"
          />
        </CtrlPanel>,
      );
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });

    it('navigates to the mode-specific URL, including origin coordinates, on click', () => {
      const clicks = [];
      render(
        <CtrlPanel position="left">
          <CtrlPanel.NearStopsAndRoutes
            modeArray={['bus']}
            language="en"
            origin={{ address: 'Pasila', lat: 60.2, lon: 24.9 }}
            onClick={url => clicks.push(url)}
            urlPrefix="/nearyou"
          />
        </CtrlPanel>,
      );
      screen.getByRole('link').click();
      expect(clicks).toEqual(['/en/nearyou/BUS/POS/Pasila::60.2,24.9']);
    });

    it('works without an origin', () => {
      const clicks = [];
      render(
        <CtrlPanel position="left">
          <CtrlPanel.NearStopsAndRoutes
            modeArray={['bus']}
            language="en"
            onClick={url => clicks.push(url)}
            urlPrefix="/nearyou"
          />
        </CtrlPanel>,
      );
      screen.getByRole('link').click();
      expect(clicks).toEqual(['/en/nearyou/BUS/POS']);
    });

    it('activates a mode link with the Enter key but ignores other keys', () => {
      const clicks = [];
      render(
        <CtrlPanel position="left">
          <CtrlPanel.NearStopsAndRoutes
            modeArray={['bus']}
            language="en"
            origin={{}}
            onClick={url => clicks.push(url)}
            urlPrefix="/nearyou"
          />
        </CtrlPanel>,
      );
      const link = screen.getByRole('link');
      fireEvent.keyDown(link, { key: 'a' });
      expect(clicks).toEqual([]);
      fireEvent.keyDown(link, { key: 'Enter' });
      expect(clicks).toEqual(['/en/nearyou/BUS/POS']);
    });

    it('collapses extra modes into a "more" button that opens the all-modes dialog', () => {
      render(
        <CtrlPanel position="left">
          <CtrlPanel.NearStopsAndRoutes
            modeArray={[
              'favorite',
              'bus',
              'tram',
              'rail',
              'subway',
              'ferry',
              'citybike',
              'carpark',
            ]}
            language="en"
            origin={{}}
            onClick={() => {}}
            urlPrefix="/nearyou"
          />
        </CtrlPanel>,
      );
      expect(screen.getAllByRole('link')).toHaveLength(7);
      expect(screen.queryByRole('dialog')).toBeNull();
      screen.getAllByRole('link')[6].click();
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getAllByRole('link').length).toBeGreaterThan(7);
    });
  });
});
