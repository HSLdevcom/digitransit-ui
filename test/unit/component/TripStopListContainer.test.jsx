import { fireEvent } from '@testing-library/react';
import TripStopListContainer from '../../../app/component/routepage/TripStopListContainer';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';

describe('<TripStopListContainer />', () => {
  it('should properly mark passed stops when vehicle information is missing', () => {
    const serviceDay = 1551650400;
    const props = {
      locationState: {},
      relay: { forceFetch: () => {} },
      trip: {
        gtfsId: 'feed:1',
        pattern: { code: 'foobar-1-1', directionId: 1 },
        route: { gtfsId: 'foobar:1', mode: 'BUS' },
        stoptimesForDate: [
          { pattern: {}, realtimeDeparture: 1000, serviceDay, stop: { gtfsId: 'stop:1' } },
          { pattern: {}, realtimeDeparture: 3000, serviceDay, stop: { gtfsId: 'stop:2' } },
        ],
      },
      tripStart: '',
    };
    const { container } = renderWithProviders(<TripStopListContainer {...props} />, {
      config: { ...mockContext.config, colors: { primary: '#007AC9' } },
      currentTime: serviceDay + 2000,
    });
    const stops = container.querySelectorAll('.route-stop');
    expect(stops).toHaveLength(2);
    expect(stops[0].classList.contains('passed')).toBe(true);
    expect(stops[1].classList.contains('passed')).toBe(false);
  });

  it('should render the selected vehicle at its next stop', () => {
    const props = {
      trip: {
        gtfsId: 'HSL:1',
        pattern: { code: 'HSL:6172:0:01', directionId: 0 },
        route: { mode: 'BUS', gtfsId: 'HSL:6172', color: null },
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
    };
    const vehicles = {
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
    };
    const { container } = renderWithProviders(<TripStopListContainer {...props} />, {
      config: { ...mockContext.config, colors: { primary: '#007AC9' } },
      currentTime: 1554882006,
      vehicles,
    });
    expect(container.querySelectorAll('.route-stop')).toHaveLength(1);
    expect(container.querySelectorAll('.route-stop-now')).toHaveLength(1);
  });

  it('should group skipped stops and mark added stops', () => {
    const serviceDay = 1551650400;
    const st = (id, realtimeState) => ({
      realtimeDeparture: 1000,
      serviceDay,
      realtimeState,
      stop: { gtfsId: `stop:${id}`, name: `Name ${id}`, alerts: [] },
    });
    const props = {
      trip: {
        gtfsId: 'feed:1',
        pattern: {
          code: 'foobar-1-1',
          directionId: 1,
          stops: [1, 2, 3, 4, 5].map(id => ({ gtfsId: `stop:${id}`, name: `Name ${id}` })),
        },
        route: { gtfsId: 'foobar:1', mode: 'BUS' },
        stoptimesForDate: [st(1, 'UPDATED'), st(2, 'CANCELED'), st(6, 'ADDED'), st(5, 'UPDATED')],
      },
      tripStart: '',
    };
    const { container, getAllByRole, queryByText } = renderWithProviders(
      <TripStopListContainer {...props} />,
      {
        config: { ...mockContext.config, colors: { primary: '#007AC9' } },
        currentTime: serviceDay,
      },
    );
    expect(container.querySelectorAll('.route-stop')).toHaveLength(3);
    expect(queryByText('Name 2')).toBeNull();
    const toggles = getAllByRole('button', { expanded: false });
    expect(toggles).toHaveLength(1);
    fireEvent.click(toggles[0]);
    ['Name 2', 'Name 3', 'Name 4'].forEach(name => expect(queryByText(name)).not.toBeNull());
    expect(container.querySelectorAll('.route-stop-replacement')).toHaveLength(1);
  });

  it('should show one group for a run of canceled stops at the trip edges', () => {
    const serviceDay = 1551650400;
    const st = (id, realtimeState) => ({
      realtimeDeparture: 1000,
      serviceDay,
      realtimeState,
      stop: { gtfsId: `stop:${id}`, name: `Name ${id}`, alerts: [] },
    });
    const props = {
      trip: {
        gtfsId: 'feed:1',
        pattern: { code: 'foobar-1-1', directionId: 1, stops: [] },
        route: { gtfsId: 'foobar:1', mode: 'BUS' },
        stoptimesForDate: [
          st(1, 'CANCELED'),
          st(2, 'CANCELED'),
          st(3, 'UPDATED'),
          st(4, 'CANCELED'),
          st(5, 'CANCELED'),
          st(6, 'CANCELED'),
        ],
      },
      tripStart: '',
    };
    const { container, getAllByRole } = renderWithProviders(<TripStopListContainer {...props} />, {
      config: { ...mockContext.config, colors: { primary: '#007AC9' } },
      currentTime: serviceDay,
    });
    expect(container.querySelectorAll('.route-stop')).toHaveLength(1);
    expect(getAllByRole('button', { expanded: false })).toHaveLength(2);
  });

  it('should show one group for a detour with interleaved canceled and added stops', () => {
    const serviceDay = 1551650400;
    const st = (id, realtimeState) => ({
      realtimeDeparture: 1000,
      serviceDay,
      realtimeState,
      stop: { gtfsId: `stop:${id}`, name: `Name ${id}`, alerts: [] },
    });
    const props = {
      trip: {
        gtfsId: 'feed:1',
        pattern: {
          code: 'foobar-1-1',
          directionId: 1,
          stops: ['a', 'c1', 'c2', 'c3', 'b'].map(id => ({
            gtfsId: `stop:${id}`,
            name: `Name ${id}`,
          })),
        },
        route: { gtfsId: 'foobar:1', mode: 'BUS' },
        stoptimesForDate: [
          st('a', 'UPDATED'),
          st('c1', 'CANCELED'),
          st('x1', 'ADDED'),
          st('c2', 'CANCELED'),
          st('x2', 'ADDED'),
          st('c3', 'CANCELED'),
          st('x3', 'ADDED'),
          st('b', 'UPDATED'),
        ],
      },
      tripStart: '',
    };
    const { container, getAllByRole } = renderWithProviders(<TripStopListContainer {...props} />, {
      config: { ...mockContext.config, colors: { primary: '#007AC9' } },
      currentTime: serviceDay,
    });
    expect(getAllByRole('button', { expanded: false })).toHaveLength(1);
    expect(container.querySelectorAll('.route-stop')).toHaveLength(5);
    expect(container.querySelectorAll('.route-stop-replacement')).toHaveLength(3);
    // the group comes before the added stops
    const html = container.innerHTML;
    expect(html.indexOf('aria-expanded')).toBeLessThan(html.indexOf('Name x1'));
  });
});
