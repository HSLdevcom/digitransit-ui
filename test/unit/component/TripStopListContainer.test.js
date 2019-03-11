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
});
