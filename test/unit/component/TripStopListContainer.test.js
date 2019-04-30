import moment from 'moment';
import React from 'react';

import TripRouteStop from '../../../app/component/TripRouteStop';
import { Component as TripStopListContainer } from '../../../app/component/TripStopListContainer';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';

describe('<TripStopListContainer />', () => {
  it('should properly mark passed stops when vehicle information is missing', () => {
    const serviceDay = 1551650400;
    const props = {
      currentTime: moment.unix(serviceDay + 2000),
      locationState: {},
      relay: {
        forceFetch: () => {},
      },
      trip: {
        pattern: {
          code: 'foobar-1-1',
          directionId: '1',
        },
        route: {
          gtfsId: 'foobar-1',
          mode: 'BUS',
        },
        stoptimesForDate: [
          {
            pattern: {},
            realtimeDeparture: 1000,
            serviceDay,
            stop: {
              gtfsId: 'stop-1',
            },
          },
          {
            pattern: {},
            realtimeDeparture: 3000,
            serviceDay,
            stop: {
              gtfsId: 'stop-2',
            },
          },
        ],
      },
      tripStart: '',
    };
    const wrapper = shallowWithIntl(<TripStopListContainer {...props} />, {
      context: {
        config: {
          nearestStopDistance: {},
        },
      },
    });
    expect(wrapper.find(TripRouteStop)).to.have.lengthOf(2);
    expect(
      wrapper
        .find(TripRouteStop)
        .at(0)
        .prop('stopPassed'),
    ).to.equal(true);
    expect(
      wrapper
        .find(TripRouteStop)
        .at(1)
        .prop('stopPassed'),
    ).to.equal(false);
  });

  it('should find the selected vehicle', () => {
    const props = {
      currentTime: moment.unix(1554882006),
      locationState: {},
      relay: {
        forceFetch: () => {},
      },
      trip: {
        pattern: {
          code: 'HSL:6172:0:01',
          directionId: 0,
        },
        route: {
          mode: 'BUS',
          gtfsId: 'HSL:6172',
          color: null,
        },
        stoptimesForDate: [
          {
            stop: {
              gtfsId: 'HSL:2314219',
              name: 'Matinkylä (M)',
              desc: 'Matinkylän term.',
              code: 'E3155',
              lat: 60.160171,
              lon: 24.738517,
              alerts: [],
            },
            realtimeDeparture: 36300,
            realtime: true,
            scheduledDeparture: 36300,
            serviceDay: 1554843600,
            realtimeState: 'UPDATED',
          },
        ],
      },
      tripStart: '1005',
      vehicles: {
        HSL_00225: {
          id: 'HSL_00225',
          route: 'HSL:6172',
          direction: 1,
          tripStartTime: '1016',
          operatingDay: '2019-04-10',
          mode: 'bus',
          next_stop: '6040278',
          timestamp: 1554881821,
          lat: 60.1305,
          long: 24.42246,
          heading: 89,
        },
        HSL_00875: {
          id: 'HSL_00875',
          route: 'HSL:6172',
          direction: 0,
          tripStartTime: '1005',
          operatingDay: '2019-04-10',
          mode: 'bus',
          next_stop: '6040231',
          timestamp: 1554881822,
          lat: 60.12307,
          long: 24.41071,
          heading: 140,
        },
      },
    };
    const wrapper = shallowWithIntl(<TripStopListContainer {...props} />, {
      context: {
        config: {
          nearestStopDistance: {},
        },
      },
    });
    expect(wrapper.find(TripRouteStop).prop('selectedVehicle').id).to.equal(
      'HSL_00875',
    );
  });
});
