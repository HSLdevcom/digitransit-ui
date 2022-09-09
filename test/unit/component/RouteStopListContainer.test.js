import React from 'react';
import moment from 'moment';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as RouteStopListContainer } from '../../../app/component/RouteStopListContainer';
import { mockMatch } from '../helpers/mock-router';

describe('<RouteStopListContainer />', () => {
  it('should render route stop list', () => {
    const props = {
      currentTime: moment(1573135114),
      pattern: {
        directionId: 0,
        code: 'feed:1',
        route: {
          mode: 'BUS',
          color: null,
        },
        stops: [
          {
            alerts: [],
            code: '2049',
            desc: 'Rautatientori',
            gtfsId: 'HSL:1020121',
            lat: 60.17164,
            lon: 24.94299,
            name: 'Rautatientori',
            stopTimesForPattern: [
              {
                pickupType: 'SCHEDULED',
                realtime: false,
                realtimeDeparture: 57540,
                realtimeState: 'SCHEDULED',
                scheduledDeparture: 57540,
                serviceDay: 1573077600,
              },
            ],
          },
          {
            alerts: [],
            code: '3088',
            desc: 'Voudintie',
            gtfsId: 'HSL:1260108',
            lat: 60.2197,
            lon: 24.96428,
            name: 'Koskela',
            stopTimesForPattern: [
              {
                pickupType: 'NONE',
                realtime: true,
                realtimeDeparture: 57234,
                realtimeState: 'UPDATED',
                scheduledDeparture: 56820,
                serviceDay: 1573077600,
              },
            ],
          },
        ],
      },
      position: {
        address: undefined,
        hasLocation: false,
        isLocationingInProgress: false,
        lat: 0,
        lon: 0,
        locationingFailed: false,
        status: 'no-location',
      },
      vehicles: {
        HSL_00494: {
          direction: 1,
          heading: 212,
          headsign: undefined,
          id: 'HSL_00494',
          lat: 60.18217,
          long: 24.96161,
          mode: 'bus',
          next_stop: 'HSL:1020121',
          operatingDay: '2019-11-07',
          route: 'HSL:1055',
          timestamp: 1573135114,
          tripStartTime: '1530',
          shortName: '55',
        },
        HSL_00594: {
          direction: 0,
          heading: 150,
          headsign: undefined,
          id: 'HSL_00594',
          lat: 60.19217,
          long: 24.95161,
          mode: 'bus',
          next_stop: 'HSL:1260108',
          operatingDay: '2019-11-07',
          route: 'HSL:1055',
          timestamp: 1573135114,
          tripStartTime: '1530',
          shortName: '55',
        },
      },
      patternId: 'HSL:1055:0:01',
      breakpoint: 'large',
      relay: {
        refetch: () => {},
      },
    };
    const wrapper = shallowWithIntl(<RouteStopListContainer {...props} />, {
      context: {
        config: {
          nearestStopDistance: {},
        },
        match: mockMatch,
      },
    });
    expect(wrapper.find('.route-stop-list')).to.have.lengthOf(1);
  });
});
