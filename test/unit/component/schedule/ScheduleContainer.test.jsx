import React from 'react';
import { DateTime } from 'luxon';
import { fireEvent } from '@testing-library/react';

import { Component as ScheduleContainer } from '../../../../app/component/routepage/schedule/ScheduleContainer';
import { renderWithProviders } from '../../helpers/mock-providers';
import { mockMatch, mockRouter } from '../../helpers/mock-router';
import { createScheduleTestContext } from '../../helpers/mock-schedule-context';

describe('<ScheduleContainer />', () => {
  let stubs;
  let mocks;
  let defaultProps;

  const mockMatchWithRouter = {
    ...mockMatch,
    router: mockRouter,
    location: {
      ...mockMatch.location,
      query: {},
    },
  };

  const mockPattern = {
    code: 'HSL:1001:0:01',
    stops: [
      { id: 'stop1', name: 'Koskela' },
      { id: 'stop2', name: 'Rautatientori' },
    ],
  };

  const patternWithFourStops = {
    ...mockPattern,
    stops: [
      { id: 'stop1', name: 'Stop 1' },
      { id: 'stop2', name: 'Stop 2' },
      { id: 'stop3', name: 'Stop 3' },
      { id: 'stop4', name: 'Stop 4' },
    ],
  };

  const mockRoute = {
    gtfsId: 'HSL:1001',
    mode: 'BUS',
    type: 3,
    agency: { name: 'HSL' },
    patterns: [
      {
        code: 'HSL:1001:0:01',
        trips: [
          {
            id: 'trip-1',
            stoptimes: [
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 28080,
                scheduledDeparture: 28080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'SCHEDULED',
                scheduledArrival: 30060,
                scheduledDeparture: 30060,
                serviceDay: 1547503200,
              },
            ],
          },
        ],
      },
    ],
  };

  const mockFirstDepartures = {
    wk1mon: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1tue: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1wed: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1thu: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1fri: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1sat: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk1sun: [{ departureStoptime: { scheduledDeparture: 28080 } }],
    wk2mon: [],
    wk2tue: [],
    wk2wed: [],
    wk2thu: [],
    wk2fri: [],
    wk2sat: [],
    wk2sun: [],
    wk3mon: [],
    wk3tue: [],
    wk3wed: [],
    wk3thu: [],
    wk3fri: [],
    wk3sat: [],
    wk3sun: [],
    wk4mon: [],
    wk4tue: [],
    wk4wed: [],
    wk4thu: [],
    wk4fri: [],
    wk4sat: [],
    wk4sun: [],
    wk5mon: [],
    wk5tue: [],
    wk5wed: [],
    wk5thu: [],
    wk5fri: [],
    wk5sat: [],
    wk5sun: [],
  };

  beforeEach(() => {
    const testContext = createScheduleTestContext({
      availableDates: [
        DateTime.fromISO('2024-01-01'),
        DateTime.fromISO('2024-01-02'),
      ],
      scheduleData: mockFirstDepartures,
    });

    mocks = testContext.mocks;
    stubs = testContext.stubs;

    defaultProps = {
      pattern: mockPattern,
      route: mockRoute,
      firstDepartures: mockFirstDepartures,
    };
  });

  const renderView = (props = {}, match = mockMatchWithRouter) =>
    renderWithProviders(
      <ScheduleContainer {...defaultProps} {...props} match={match} />,
      {
        config: mocks.config,
        match,
        router: mockRouter,
      },
    );

  it('should initialize from/to stops covering the whole pattern', () => {
    const { container } = renderView();
    expect(container.querySelector('.route-schedule-header')).not.toBeNull();
    expect(container.querySelectorAll('.dd-container.withLabel')).toHaveLength(
      2,
    );
    expect(container.querySelectorAll('.trip-column')).toHaveLength(1);
  });

  it('should update the trip list when the destination stop changes', () => {
    const { container } = renderView({ pattern: patternWithFourStops });
    const destinationInput = container.querySelector('#aria-input-destination');

    fireEvent.focus(destinationInput);
    fireEvent.mouseDown(destinationInput);
    // Destination options start after the origin (stop1): [Stop2, Stop3,
    // Stop4]. The current destination (Stop4) matches an option, so the menu
    // opens with it already focused; two ArrowUp presses land on 'Stop 2'.
    fireEvent.keyDown(destinationInput, { key: 'ArrowUp' });
    fireEvent.keyDown(destinationInput, { key: 'ArrowUp' });
    fireEvent.keyDown(destinationInput, { key: 'Enter' });

    expect(
      container.querySelector('.dd-right__single-value').textContent,
    ).toContain('Stop 2');
  });

  it('should auto-adjust the destination when the origin moves past it', () => {
    const { container } = renderView({ pattern: patternWithFourStops });
    const originInput = container.querySelector('#aria-input-origin');

    fireEvent.focus(originInput);
    fireEvent.mouseDown(originInput);
    // Origin options are [Stop1, Stop2, Stop3]; the current origin (Stop1)
    // matches an option, so the menu opens with it already focused. Two
    // ArrowDown presses land on 'Stop 3', which is past the current
    // destination ('Stop 2') and should push it forward.
    fireEvent.keyDown(originInput, { key: 'ArrowDown' });
    fireEvent.keyDown(originInput, { key: 'ArrowDown' });
    fireEvent.keyDown(originInput, { key: 'Enter' });

    expect(container.querySelector('.dd__single-value').textContent).toContain(
      'Stop 3',
    );
    expect(
      container.querySelector('.dd-right__single-value').textContent,
    ).toContain('Stop 4');
  });

  it('should render all trips returned by the trip-list utility', () => {
    stubs.getTripsList.mockReturnValue({
      trips: [
        {
          id: 'trip-1',
          stoptimes: [
            {
              serviceDay: 1547503200,
              scheduledArrival: 28080,
              scheduledDeparture: 28080,
            },
            {
              serviceDay: 1547503200,
              scheduledArrival: 30060,
              scheduledDeparture: 30060,
            },
          ],
        },
        {
          id: 'trip-2',
          stoptimes: [
            {
              serviceDay: 1547503200,
              scheduledArrival: 32040,
              scheduledDeparture: 32040,
            },
            {
              serviceDay: 1547503200,
              scheduledArrival: 34020,
              scheduledDeparture: 34020,
            },
          ],
        },
      ],
      noTripsMessage: null,
    });

    const { container } = renderView();
    expect(container.querySelectorAll('.trip-column')).toHaveLength(2);
  });

  it('should update URL with serviceDay query param when user changes date', () => {
    const routerReplaceSpy = vi.fn();
    const matchWithSpy = {
      ...mockMatchWithRouter,
      router: { ...mockRouter, replace: routerReplaceSpy },
    };

    const { container } = renderView({}, matchWithSpy);
    const dateInput = container.querySelector(
      '#aria-input-route-schedule-grouped-datepicker',
    );

    fireEvent.focus(dateInput);
    fireEvent.mouseDown(dateInput);
    // The two stubbed available dates (2024-01-01, 2024-01-02) fall in a
    // single group; the wanted day (today) doesn't match either option, so
    // the menu opens with the first option (2024-01-01) already focused.
    // A single ArrowDown moves focus to 2024-01-02.
    fireEvent.keyDown(dateInput, { key: 'ArrowDown' });
    fireEvent.keyDown(dateInput, { key: 'Enter' });

    expect(routerReplaceSpy.mock.calls.length).toBe(1);
    expect(routerReplaceSpy.mock.calls[0][0].query.serviceDay).toBe('20240102');
  });

  it('should preserve other query params when changing date', () => {
    const routerReplaceSpy = vi.fn();
    const matchWithQuery = {
      ...mockMatchWithRouter,
      location: {
        ...mockMatchWithRouter.location,
        query: { test: '1', someOtherParam: 'value' },
      },
      router: { ...mockRouter, replace: routerReplaceSpy },
    };

    const { container } = renderView({}, matchWithQuery);
    const dateInput = container.querySelector(
      '#aria-input-route-schedule-grouped-datepicker',
    );

    fireEvent.focus(dateInput);
    fireEvent.mouseDown(dateInput);
    // See the identical scenario above: the menu opens with 2024-01-01
    // already focused, so a single ArrowDown reaches 2024-01-02.
    fireEvent.keyDown(dateInput, { key: 'ArrowDown' });
    fireEvent.keyDown(dateInput, { key: 'Enter' });

    const callArgs = routerReplaceSpy.mock.calls[0][0];
    expect(callArgs.query.serviceDay).toBe('20240102');
    expect(callArgs.query.test).toBe('1');
    expect(callArgs.query.someOtherParam).toBe('value');
  });

  it('should parse serviceDay URL query param and keep it selected', () => {
    const matchWithServiceDay = {
      ...mockMatchWithRouter,
      location: {
        ...mockMatchWithRouter.location,
        query: { serviceDay: '20240102' },
      },
    };
    const { container } = renderView({}, matchWithServiceDay);
    expect(
      container.querySelector('.route-schedule-grouped-date-select'),
    ).not.toBeNull();
  });

  it('should keep today selected when service starts in the future', () => {
    const nextMonday = DateTime.local().startOf('week').plus({ weeks: 1 });
    const nextTuesday = nextMonday.plus({ days: 1 });
    stubs.buildAvailableDates.mockReturnValue([nextMonday, nextTuesday]);

    const { container } = renderView();
    const selectedDay = container.querySelector(
      '.route-schedule-grouped__single-value',
    );

    expect(selectedDay).not.toBeNull();
  });

  it('should show constant operation view instead of timetable when route has constant operation', () => {
    mocks.config.constantOperationRoutes = {
      'HSL:1001': {
        en: { text: 'Always on', link: 'https://example.com' },
      },
    };

    const { container } = renderView();
    expect(container.querySelector('.route-timetable-panel')).not.toBeNull();
    expect(container.querySelector('.route-schedule-header')).toBeNull();
  });

  it('should show regular timetable when route has no constant operation', () => {
    mocks.config.constantOperationRoutes = {};
    const { container } = renderView();
    expect(container.querySelector('.route-schedule-header')).not.toBeNull();
    expect(container.querySelector('.route-page-action-bar')).not.toBeNull();
  });

  it('should not show RouteControlPanel when route has no patterns', () => {
    const { container } = renderView({
      route: { ...mockRoute, patterns: null },
    });
    expect(
      container.querySelector('.route-page-control-panel-container'),
    ).toBeNull();
  });

  it('should show no-trips message when no trips are available', () => {
    stubs.getTripsList.mockReturnValue({
      trips: null,
      noTripsMessage: <div className="no-trips-test">No service today</div>,
    });

    const { container } = renderView();
    expect(container.querySelector('.no-trips-test').textContent).toBe(
      'No service today',
    );
  });

  it('should show timetable print button when route PDF config exists', () => {
    mocks.config.URL.ROUTE_TIMETABLES = { HSL: 'https://example.com' };
    mocks.config.timetables = {
      HSL: {
        routeTimetableUrlResolver: vi
          .fn()
          .mockReturnValue({ href: 'https://example.com/timetable.pdf' }),
      },
    };

    const { container } = renderView();
    expect(container.querySelector('.print-timetable')).not.toBeNull();
  });

  it('should not show timetable print button when route PDF config is missing', () => {
    mocks.config.URL.ROUTE_TIMETABLES = {};
    mocks.config.timetables = {};

    const { container } = renderView();
    expect(container.querySelector('.print-timetable')).toBeNull();
  });
});
