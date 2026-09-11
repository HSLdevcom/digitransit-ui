import React from 'react';
import { Component as TripStopListContainer } from '../../../app/component/routepage/TripStopListContainer';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';

describe('<TripStopListContainer />', () => {
  it('should properly mark passed stops when vehicle information is missing', () => {
    const serviceDay = 1551650400;
    const props = {
      locationState: {},
      relay: {
        forceFetch: () => {},
      },
      trip: {
        gtfsId: 'feed:1',
        pattern: {
          code: 'foobar-1-1',
          directionId: 1,
        },
        route: {
          gtfsId: 'foobar:1',
          mode: 'BUS',
        },
        stoptimesForDate: [
          {
            pattern: {},
            realtimeDeparture: 1000,
            serviceDay,
            stop: {
              gtfsId: 'stop:1',
            },
          },
          {
            pattern: {},
            realtimeDeparture: 3000,
            serviceDay,
            stop: {
              gtfsId: 'stop:2',
            },
          },
        ],
      },
      vehicles: {},
      tripStart: '',
      breakpoint: 'large',
    };
    const { container } = renderWithProviders(
      <TripStopListContainer {...props} />,
      {
        config: { ...mockContext.config, colors: { primary: '#007AC9' } },
        currentTime: serviceDay + 2000,
      },
    );
    const stops = container.querySelectorAll('.route-stop');
    expect(stops).to.have.lengthOf(2);
    expect(stops[0].classList.contains('passed')).to.equal(true);
    expect(stops[1].classList.contains('passed')).to.equal(false);
  });

  it('should render the selected vehicle at its next stop', () => {
    const props = {
      trip: {
        gtfsId: 'HSL:1',
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
            realtimeArrival: 36300,
            realtimeDeparture: 36300,
            scheduledDeparture: 36300,
            serviceDay: 1554843600,
            realtime: true,
            realtimeState: 'UPDATED',
          },
        ],
      },
      tripStart: '1005',
      vehicles: {
        HSL_00875: {
          id: 'HSL_00875',
          route: 'HSL:6172',
          direction: 0,
          tripStartTime: '1005',
          operatingDay: '2019-04-10',
          mode: 'bus',
          shortName: '875',
          next_stop: 'HSL:2314219',
          timestamp: 1554881822,
          lat: 60.12307,
          long: 24.41071,
          heading: 140,
        },
      },
      breakpoint: 'large',
    };
    const { container } = renderWithProviders(
      <TripStopListContainer {...props} />,
      {
        config: { ...mockContext.config, colors: { primary: '#007AC9' } },
        currentTime: 1554882006,
      },
    );
    expect(container.querySelectorAll('.route-stop')).to.have.lengthOf(1);
    expect(container.querySelectorAll('.route-stop-now')).to.have.lengthOf(1);
  });
});
