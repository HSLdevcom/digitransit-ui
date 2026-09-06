import React from 'react';
import { DateTime } from 'luxon';
import { shallow } from 'enzyme';

import { Component as ScheduleContainer } from '../../../../app/component/routepage/schedule/ScheduleContainer';
import ScheduleHeader from '../../../../app/component/routepage/schedule/ScheduleHeader';
import ScheduleTripList from '../../../../app/component/routepage/schedule/ScheduleTripList';
import DateSelectGrouped from '../../../../app/component/stop/DateSelectGrouped';
import ScheduleConstantOperation from '../../../../app/component/routepage/schedule/ScheduleConstantOperation';
import RouteControlPanel from '../../../../app/component/routepage/RouteControlPanel';
import SecondaryButton from '../../../../app/component/SecondaryButton';
import { DATE_FORMAT } from '../../../../app/constants';
import { mockMatch, mockRouter } from '../../helpers/mock-router';
import { createScheduleTestContext } from '../../helpers/mock-schedule-context';

describe('<ScheduleContainer />', () => {
  let stubs;
  let mocks;
  let defaultProps;
  let routerReplaceSpy;

  // A match with an empty query, reused across most tests
  const mockMatchWithRouter = {
    ...mockMatch,
    router: mockRouter,
    location: {
      ...mockMatch.location,
      query: {},
    },
  };

  // Mock data - defined once and reused
  const mockPattern = {
    code: 'HSL:1001:0:01',
    stops: [
      {
        id: 'stop1',
        name: 'Koskela',
      },
      {
        id: 'stop2',
        name: 'Rautatientori',
      },
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
    // Create test context with all stubs
    const testContext = createScheduleTestContext({
      availableDates: [
        DateTime.fromISO('2024-01-01'),
        DateTime.fromISO('2024-01-02'),
      ],
      scheduleData: mockFirstDepartures,
    });

    mocks = testContext.mocks;
    stubs = testContext.stubs;

    routerReplaceSpy = vi.spyOn(mockRouter, 'replace');

    defaultProps = {
      pattern: mockPattern,
      route: mockRoute,
      firstDepartures: mockFirstDepartures,
    };
  });

  describe('State initialization', () => {
    it('should initialize from/to stops covering entire pattern', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const header = wrapper.find(ScheduleHeader);
      const tripList = wrapper.find(ScheduleTripList);

      expect(header.prop('from')).toBe(0);
      expect(header.prop('to')).toBe(1);
      expect(tripList.prop('fromIdx')).toBe(0);
      expect(tripList.prop('toIdx')).toBe(1);
    });
  });

  describe('Stop selection interactions', () => {
    it('should update trip list when user changes destination stop', () => {
      const patternWithMoreStops = {
        ...mockPattern,
        code: 'HSL:1001:0:01',
        stops: [
          { id: 'stop1', name: 'Stop 1' },
          { id: 'stop2', name: 'Stop 2' },
          { id: 'stop3', name: 'Stop 3' },
          { id: 'stop4', name: 'Stop 4' },
        ],
      };
      const props = {
        ...defaultProps,
        pattern: patternWithMoreStops,
      };

      const wrapper = shallow(
        <ScheduleContainer {...props} match={mockMatchWithRouter} />,
      );

      // User selects stop 2 as destination
      wrapper.find(ScheduleHeader).prop('onToSelectChange')(2);
      wrapper.update();

      expect(wrapper.find(ScheduleHeader).prop('to')).toBe(2);
      expect(wrapper.find(ScheduleTripList).prop('toIdx')).toBe(2);
    });

    it('should auto-adjust destination when origin is moved past it', () => {
      const patternWithMoreStops = {
        ...mockPattern,
        code: 'HSL:1001:0:01',
        stops: [
          { id: 'stop1', name: 'Stop 1' },
          { id: 'stop2', name: 'Stop 2' },
          { id: 'stop3', name: 'Stop 3' },
          { id: 'stop4', name: 'Stop 4' },
        ],
      };
      const props = {
        ...defaultProps,
        pattern: patternWithMoreStops,
      };

      const wrapper = shallow(
        <ScheduleContainer {...props} match={mockMatchWithRouter} />,
      );

      // to starts at 3 (last stop); move origin to 3 — destination must step forward
      wrapper.find(ScheduleHeader).prop('onFromSelectChange')(3);
      wrapper.update();

      expect(wrapper.find(ScheduleHeader).prop('from')).toBe(3);
      expect(wrapper.find(ScheduleHeader).prop('to')).toBe(3);
      expect(wrapper.find(ScheduleTripList).prop('fromIdx')).toBe(3);
      expect(wrapper.find(ScheduleTripList).prop('toIdx')).toBe(3);
    });
  });

  describe('Date selection interactions', () => {
    it('should update URL with serviceDay query param when user changes date', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      wrapper.find(DateSelectGrouped).prop('onDateChange')('20240102');

      expect(routerReplaceSpy).toHaveBeenCalledOnce();
      const callArgs = routerReplaceSpy.mock.calls[0][0];
      expect(callArgs.query.serviceDay).toBe('20240102');
    });

    it('should preserve other query params when changing date', () => {
      const matchWithQuery = {
        ...mockMatchWithRouter,
        location: {
          ...mockMatchWithRouter.location,
          query: {
            test: '1',
            someOtherParam: 'value',
          },
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={matchWithQuery} />,
      );

      wrapper.find(DateSelectGrouped).prop('onDateChange')('20240103');

      const callArgs = routerReplaceSpy.mock.calls[0][0];
      expect(callArgs.query.serviceDay).toBe('20240103');
      expect(callArgs.query.test).toBe('1');
      expect(callArgs.query.someOtherParam).toBe('value');
    });

    it('should parse serviceDay URL query param and pass it to DateSelectGrouped', () => {
      const matchWithServiceDay = {
        ...mockMatchWithRouter,
        location: {
          ...mockMatchWithRouter.location,
          query: { serviceDay: '20240102' },
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={matchWithServiceDay} />,
      );

      const dateSelect = wrapper.find(DateSelectGrouped);
      expect(dateSelect.prop('selectedDay').toISODate()).toBe('2024-01-02');
    });

    it('should pass today as selectedDay when service only starts in the future', () => {
      // Service does not operate today — first available date is next Monday
      const nextMonday = DateTime.local().startOf('week').plus({ weeks: 1 });
      const nextTuesday = nextMonday.plus({ days: 1 });

      stubs.buildAvailableDates.mockReturnValue([nextMonday, nextTuesday]);

      // No serviceDay in URL — wantedDay should default to today
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const dateSelect = wrapper.find(DateSelectGrouped);
      // The data is fetched for today; the picker must show today so the
      // selected value matches what is actually being displayed.
      const today = DateTime.local();
      expect(dateSelect.prop('selectedDay').toISODate()).toBe(
        today.toISODate(),
      );
    });
  });

  describe('Conditional rendering based on data and config', () => {
    it('should show constant operation view instead of timetable when route has constant operation', () => {
      mocks.config.constantOperationRoutes = {
        'HSL:1001': {
          en: { text: 'Always on', link: 'https://example.com' },
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      // Should render constant operation component
      const constantOp = wrapper.find(ScheduleConstantOperation);
      expect(constantOp).toHaveLength(1);
      expect(constantOp.prop('route')).toBe(defaultProps.route);

      expect(wrapper.find(ScheduleHeader)).toHaveLength(0);
      expect(wrapper.find(ScheduleTripList)).toHaveLength(0);
    });

    it('should show regular timetable when route has no constant operation', () => {
      mocks.config.constantOperationRoutes = {};

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      expect(wrapper.find(ScheduleHeader)).toHaveLength(1);
      expect(wrapper.find(ScheduleTripList)).toHaveLength(1);

      expect(wrapper.find(ScheduleConstantOperation)).toHaveLength(0);
    });

    it('should not show RouteControlPanel when route has no patterns', () => {
      const routeWithoutPatterns = {
        ...mockRoute,
        patterns: null,
      };
      const props = {
        ...defaultProps,
        route: routeWithoutPatterns,
      };

      const wrapper = shallow(
        <ScheduleContainer {...props} match={mockMatchWithRouter} />,
      );

      expect(wrapper.find(RouteControlPanel)).toHaveLength(0);
    });

    it('should show no-trips message when no trips are available', () => {
      stubs.getTripsList.mockReturnValue({
        trips: null,
        noTripsMessage: <div className="no-trips-test">No service today</div>,
      });

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      expect(wrapper.find('.no-trips-test')).toHaveLength(1);
      expect(wrapper.find('.no-trips-test').text()).toBe('No service today');

      expect(wrapper.find(ScheduleTripList)).toHaveLength(0);
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

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const printButton = wrapper
        .find(SecondaryButton)
        .filterWhere(button => button.prop('buttonName') === 'print-timetable');

      expect(printButton).toHaveLength(1);
      expect(typeof printButton.prop('buttonClickAction')).toBe('function');
    });

    it('should not show timetable print button when route PDF config is missing', () => {
      mocks.config.URL.ROUTE_TIMETABLES = {};
      mocks.config.timetables = {};

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const printButton = wrapper
        .find(SecondaryButton)
        .filterWhere(button => button.prop('buttonName') === 'print-timetable');

      expect(printButton).toHaveLength(0);
    });
  });

  describe('Component coordination', () => {
    it('should pass pattern stops to header component', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const header = wrapper.find(ScheduleHeader);
      expect(header.prop('stops')).toBe(defaultProps.pattern.stops);
    });

    it('should pass trips from utility to trip list component', () => {
      const mockTrips = [
        { id: 'trip-1', stoptimes: [] },
        { id: 'trip-2', stoptimes: [] },
      ];
      stubs.getTripsList.mockReturnValue({
        trips: mockTrips,
        noTripsMessage: null,
      });

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const tripList = wrapper.find(ScheduleTripList);
      expect(tripList.prop('trips')).toBe(mockTrips);
    });

    it('should pass route and breakpoint to control panel', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const controlPanel = wrapper.find(RouteControlPanel);
      expect(controlPanel.prop('route')).toBe(defaultProps.route);
      expect(controlPanel.prop('breakpoint')).toBe('large');
    });

    it('should pass available dates to date selector', () => {
      const mockDates = [
        DateTime.fromISO('2024-01-01'),
        DateTime.fromISO('2024-01-02'),
        DateTime.fromISO('2024-01-03'),
      ];
      stubs.buildAvailableDates.mockReturnValue(mockDates);

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const dateSelect = wrapper.find(DateSelectGrouped);
      expect(dateSelect.prop('dates')).toBe(mockDates);
      expect(dateSelect.prop('dateFormat')).toBe(DATE_FORMAT);
    });

    it('should keep header and trip list from/to indices synchronized', () => {
      const patternWithMoreStops = {
        ...mockPattern,
        code: 'HSL:1001:0:01',
        stops: [
          { id: 'stop1', name: 'Stop 1' },
          { id: 'stop2', name: 'Stop 2' },
          { id: 'stop3', name: 'Stop 3' },
        ],
      };
      const props = {
        ...defaultProps,
        pattern: patternWithMoreStops,
      };

      const wrapper = shallow(
        <ScheduleContainer {...props} match={mockMatchWithRouter} />,
      );

      // Change origin
      wrapper.find(ScheduleHeader).prop('onFromSelectChange')(1);
      wrapper.update();

      expect(wrapper.find(ScheduleHeader).prop('from')).toBe(1);
      expect(wrapper.find(ScheduleTripList).prop('fromIdx')).toBe(1);

      // Change destination
      wrapper.find(ScheduleHeader).prop('onToSelectChange')(1);
      wrapper.update();

      expect(wrapper.find(ScheduleHeader).prop('to')).toBe(1);
      expect(wrapper.find(ScheduleTripList).prop('toIdx')).toBe(1);
    });
  });
});
