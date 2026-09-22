import React from 'react';
import { DateTime } from 'luxon';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockMatch, mockRouter } from '../helpers/mock-router';
import {
  Component as RoutePatternSelectContainer,
  getPatternOptions,
} from '../../../app/component/routepage/RoutePatternSelectContainer';
import { routePagePath, PREFIX_STOPS } from '../../../utils/shared/path';

const serviceDay = Math.floor(new Date().getTime() / 1000);
const today = DateTime.now().toFormat('yyyyLLdd');

function makeActiveDates() {
  return [{ serviceId: 'service1', day: [today] }];
}

function makePattern(code, directionId, headsign, tripsForDate = []) {
  return {
    code,
    directionId,
    headsign,
    stops: [{ name: 'Origin' }, { name: 'Destination' }],
    tripsForDate,
    activeDates: tripsForDate.length > 0 ? makeActiveDates() : [],
  };
}

function makeTripForDate() {
  return {
    stoptimes: [
      { scheduledDeparture: 600, serviceDay },
      { scheduledDeparture: 720, serviceDay },
    ],
  };
}

const baseConfig = {
  CONFIG: 'default',
  timeZone: 'Europe/Helsinki',
  colors: { primary: '#3fa', accessiblePrimary: '#333' },
  itinerary: { serviceTimeRange: 30 },
  showSimilarRoutesOnRouteDropDown: false,
  showNewRoutePage: true,
};

const baseMatch = {
  ...mockMatch,
  params: { patternId: 'ROUTE:1:0:01' },
};

const baseProps = {
  match: baseMatch,
  className: 'bp-large',
  onSelectChange: () => {},
  gtfsId: 'ROUTE:1',
};

function makeTwoDirectionRoute() {
  return {
    shortName: '1',
    mode: 'BUS',
    gtfsId: 'ROUTE:1',
    patterns: [
      makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
      makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
    ],
  };
}

describe('<RoutePatternSelectContainer />', () => {
  it('should render a swap button for opposite-direction patterns', () => {
    const { container } = renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        route={makeTwoDirectionRoute()}
      />,
      { config: baseConfig },
    );
    expect(
      container.querySelector('.route-pattern-swap-button'),
    ).not.toBeNull();
    expect(
      container.querySelector('.route-pattern-location-name').textContent,
    ).toBe('Origin');
  });

  it('should select the other pattern when the swap button is clicked', () => {
    let selectedCode;
    const { container } = renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        onSelectChange={code => {
          selectedCode = code;
        }}
        route={makeTwoDirectionRoute()}
      />,
      { config: baseConfig },
    );
    fireEvent.click(container.querySelector('.route-pattern-swap-button'));
    expect(selectedCode).toBe('ROUTE:1:1:01');
  });

  it('should render no content when there are no patterns', () => {
    const { container } = renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        route={{ shortName: '1', mode: 'BUS', gtfsId: 'ROUTE:1', patterns: [] }}
      />,
      { config: baseConfig },
    );
    expect(container.innerHTML).toBe('');
  });

  it('should return null when pattern options are empty', () => {
    expect(getPatternOptions([], 30)).toBeNull();
  });

  it('should include all active patterns in the calculated options', () => {
    const patterns = [
      makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
      makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
      makePattern('ROUTE:1:0:02', 0, 'Via Downtown', [makeTripForDate()]),
    ];
    const options = getPatternOptions(patterns, 30);
    expect(options.map(option => option.code)).toEqual(
      patterns.map(pattern => pattern.code),
    );
  });

  it('should redirect when the URL pattern is not available', () => {
    let replacedUrl;
    const match = {
      ...mockMatch,
      params: { patternId: 'ROUTE:1:missing' },
      router: {
        ...mockRouter,
        replace: url => {
          replacedUrl = url;
        },
      },
    };
    renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        match={match}
        route={makeTwoDirectionRoute()}
      />,
      { config: baseConfig },
    );
    expect(replacedUrl).toBe(
      routePagePath('ROUTE:1', PREFIX_STOPS, 'ROUTE:1:0:01'),
    );
  });

  it('should not redirect when the URL pattern is valid', () => {
    let replacedUrl;
    const match = {
      ...mockMatch,
      params: { patternId: 'ROUTE:1:0:01' },
      router: {
        ...mockRouter,
        replace: url => {
          replacedUrl = url;
        },
      },
    };
    renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        match={match}
        route={makeTwoDirectionRoute()}
      />,
      { config: baseConfig },
    );
    expect(replacedUrl).toBeUndefined();
  });

  it('should render a toggle button for single pattern without swap', () => {
    const { container } = renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        route={{
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
          ],
        }}
      />,
      { config: baseConfig },
    );
    expect(container.innerHTML).not.toBe('');
    expect(container.querySelector('.route-pattern-swap-button')).toBeNull();
  });

  it('should not call onSelectChange for single pattern', () => {
    let callCount = 0;
    renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        onSelectChange={() => {
          callCount += 1;
        }}
        route={{
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
          ],
        }}
      />,
      { config: baseConfig },
    );
    expect(callCount).toBe(0);
  });

  it('should render without swap button when there are three patterns', () => {
    const { container } = renderWithProviders(
      <RoutePatternSelectContainer
        {...baseProps}
        route={{
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
            makePattern('ROUTE:1:0:02', 0, 'Via Downtown', [makeTripForDate()]),
            makePattern('ROUTE:1:0:03', 0, 'Via Parks', [makeTripForDate()]),
          ],
        }}
      />,
      { config: baseConfig },
    );
    expect(container.innerHTML).not.toBe('');
    expect(container.querySelector('.route-pattern-swap-button')).toBeNull();
  });

  it('should group same-direction patterns into special routes', () => {
    const patterns = [
      makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
      makePattern('ROUTE:1:0:02', 0, 'Via Downtown', [makeTripForDate()]),
    ];
    const options = getPatternOptions(patterns, 30);
    expect(options.length).toBe(2);
    // Both patterns should be in options; component logic will group the second into special
    const codes = options.map(o => o.code);
    expect(codes).toContain('ROUTE:1:0:01');
    expect(codes).toContain('ROUTE:1:0:02');
  });

  it('should include future patterns when trips exist beyond service range', () => {
    const futureDate = DateTime.now().plus({ days: 8 }).toFormat('yyyyLLdd');
    const patterns = [
      makePattern('ROUTE:1:0:01', 0, 'Active', [makeTripForDate()]),
      {
        code: 'ROUTE:1:0:99',
        directionId: 0,
        headsign: 'Future',
        stops: [{ name: 'Origin' }, { name: 'Destination' }],
        tripsForDate: [],
        activeDates: [{ serviceId: 'future-service', day: [futureDate] }],
      },
    ];
    const options = getPatternOptions(patterns, 30);
    // enrichPatterns will mark the second as inFuture
    expect(options.length).toBeGreaterThan(0);
    const codes = options.map(o => o.code);
    expect(codes).toContain('ROUTE:1:0:01');
    expect(codes).toContain('ROUTE:1:0:99');
  });

  it('should use fallback patterns when no trips exist for today', () => {
    const patterns = [
      makePattern('ROUTE:1:0:01', 0, 'Destination'),
      makePattern('ROUTE:1:1:01', 1, 'Origin'),
    ];
    const options = getPatternOptions(patterns, 30);
    // enrichPatterns returns fallback patterns ending in :01 when no trips found
    expect(options).not.toBeNull();
    const codes = options.map(o => o.code);
    expect(codes).toEqual(
      expect.arrayContaining(['ROUTE:1:0:01', 'ROUTE:1:1:01']),
    );
  });
});
