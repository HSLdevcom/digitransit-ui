import React from 'react';
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
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
  let sandbox;
  let stubs;
  let mocks;
  let defaultProps;
  let mockMatchWithRouter;
  let routerReplaceSpy;

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
    // Create test context with sandbox and all stubs
    const testContext = createScheduleTestContext({
      availableDates: [
        DateTime.fromISO('2024-01-01'),
        DateTime.fromISO('2024-01-02'),
      ],
      scheduleData: mockFirstDepartures,
    });

    sandbox = testContext.sandbox;
    mocks = testContext.mocks;
    stubs = testContext.stubs;

    routerReplaceSpy = sandbox.spy(mockRouter, 'replace');

    // Setup default props - pass actual mock data objects
    // useFragment will pass them through as-is in tests
    defaultProps = {
      pattern: mockPattern,
      route: mockRoute,
      firstDepartures: mockFirstDepartures,
      breakpoint: 'large',
      lang: 'en',
      router: mockRouter,
    };

    mockMatchWithRouter = {
      ...mockMatch,
      router: mockRouter,
      location: {
        ...mockMatch.location,
        query: {},
      },
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('State initialization', () => {
    it('should initialize from/to stops covering entire pattern', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const header = wrapper.find(ScheduleHeader);
      const tripList = wrapper.find(ScheduleTripList);

      // Should start at first stop and end at last stop
      expect(header.prop('from')).to.equal(0);
      expect(header.prop('to')).to.equal(1); // pattern has 2 stops (0-1)
      expect(tripList.prop('fromIdx')).to.equal(0);
      expect(tripList.prop('toIdx')).to.equal(1);
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

      // Both header and trip list should update
      expect(wrapper.find(ScheduleHeader).prop('to')).to.equal(2);
      expect(wrapper.find(ScheduleTripList).prop('toIdx')).to.equal(2);
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

      // origin is 3, so destination auto-adjusts to min(3+1, 3) = 3
      expect(wrapper.find(ScheduleHeader).prop('from')).to.equal(3);
      expect(wrapper.find(ScheduleHeader).prop('to')).to.equal(3);
      expect(wrapper.find(ScheduleTripList).prop('fromIdx')).to.equal(3);
      expect(wrapper.find(ScheduleTripList).prop('toIdx')).to.equal(3);
    });
  });

  describe('Date selection interactions', () => {
    it('should update URL with serviceDay query param when user changes date', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      wrapper.find(DateSelectGrouped).prop('onDateChange')('20240102');

      expect(routerReplaceSpy.calledOnce).to.equal(true);
      const callArgs = routerReplaceSpy.firstCall.args[0];
      expect(callArgs.query.serviceDay).to.equal('20240102');
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

      const callArgs = routerReplaceSpy.firstCall.args[0];
      expect(callArgs.query.serviceDay).to.equal('20240103');
      expect(callArgs.query.test).to.equal('1');
      expect(callArgs.query.someOtherParam).to.equal('value');
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
      expect(dateSelect.prop('selectedDay').toISODate()).to.equal('2024-01-02');
    });

    it('should pass today as selectedDay when service only starts in the future', () => {
      // Service does not operate today — first available date is next Monday
      const nextMonday = DateTime.local().startOf('week').plus({ weeks: 1 });
      const nextTuesday = nextMonday.plus({ days: 1 });

      stubs.buildAvailableDates.returns([nextMonday, nextTuesday]);

      // No serviceDay in URL — wantedDay should default to today
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const dateSelect = wrapper.find(DateSelectGrouped);
      // The data is fetched for today; the picker must show today so the
      // selected value matches what is actually being displayed.
      const today = DateTime.local();
      expect(dateSelect.prop('selectedDay').toISODate()).to.equal(
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
      expect(constantOp).to.have.lengthOf(1);
      expect(constantOp.prop('route')).to.equal(defaultProps.route);

      // Should not render regular timetable components
      expect(wrapper.find(ScheduleHeader)).to.have.lengthOf(0);
      expect(wrapper.find(ScheduleTripList)).to.have.lengthOf(0);
    });

    it('should show regular timetable when route has no constant operation', () => {
      mocks.config.constantOperationRoutes = {};

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      // Should render regular timetable components
      expect(wrapper.find(ScheduleHeader)).to.have.lengthOf(1);
      expect(wrapper.find(ScheduleTripList)).to.have.lengthOf(1);

      // Should not render constant operation component
      expect(wrapper.find(ScheduleConstantOperation)).to.have.lengthOf(0);
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

      expect(wrapper.find(RouteControlPanel)).to.have.lengthOf(0);
    });

    it('should show no-trips message when no trips are available', () => {
      stubs.getTripsList.returns({
        trips: null,
        noTripsMessage: <div className="no-trips-test">No service today</div>,
      });

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      // Should show the no-trips message
      expect(wrapper.find('.no-trips-test')).to.have.lengthOf(1);
      expect(wrapper.find('.no-trips-test').text()).to.equal(
        'No service today',
      );

      // Should not show trip list
      expect(wrapper.find(ScheduleTripList)).to.have.lengthOf(0);
    });

    it('should show timetable print button when route PDF config exists', () => {
      mocks.config.URL.ROUTE_TIMETABLES = { HSL: 'https://example.com' };
      mocks.config.timetables = {
        HSL: {
          routeTimetableUrlResolver: sandbox
            .stub()
            .returns({ href: 'https://example.com/timetable.pdf' }),
        },
      };

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const printButton = wrapper
        .find(SecondaryButton)
        .filterWhere(button => button.prop('buttonName') === 'print-timetable');

      expect(printButton).to.have.lengthOf(1);
      expect(printButton.prop('buttonClickAction')).to.be.a('function');
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

      expect(printButton).to.have.lengthOf(0);
    });
  });

  describe('Component coordination', () => {
    it('should pass pattern stops to header component', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const header = wrapper.find(ScheduleHeader);
      expect(header.prop('stops')).to.equal(defaultProps.pattern.stops);
    });

    it('should pass trips from utility to trip list component', () => {
      const mockTrips = [
        { id: 'trip-1', stoptimes: [] },
        { id: 'trip-2', stoptimes: [] },
      ];
      stubs.getTripsList.returns({ trips: mockTrips, noTripsMessage: null });

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const tripList = wrapper.find(ScheduleTripList);
      expect(tripList.prop('trips')).to.equal(mockTrips);
    });

    it('should pass route and breakpoint to control panel', () => {
      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const controlPanel = wrapper.find(RouteControlPanel);
      expect(controlPanel.prop('route')).to.equal(defaultProps.route);
      expect(controlPanel.prop('breakpoint')).to.equal('large');
    });

    it('should pass available dates to date selector', () => {
      const mockDates = [
        DateTime.fromISO('2024-01-01'),
        DateTime.fromISO('2024-01-02'),
        DateTime.fromISO('2024-01-03'),
      ];
      stubs.buildAvailableDates.returns(mockDates);

      const wrapper = shallow(
        <ScheduleContainer {...defaultProps} match={mockMatchWithRouter} />,
      );

      const dateSelect = wrapper.find(DateSelectGrouped);
      expect(dateSelect.prop('dates')).to.equal(mockDates);
      expect(dateSelect.prop('dateFormat')).to.equal(DATE_FORMAT);
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

      // Header and trip list should match
      expect(wrapper.find(ScheduleHeader).prop('from')).to.equal(1);
      expect(wrapper.find(ScheduleTripList).prop('fromIdx')).to.equal(1);

      // Change destination
      wrapper.find(ScheduleHeader).prop('onToSelectChange')(1);
      wrapper.update();

      // Both should stay synchronized
      expect(wrapper.find(ScheduleHeader).prop('to')).to.equal(1);
      expect(wrapper.find(ScheduleTripList).prop('toIdx')).to.equal(1);
    });
  });
});
