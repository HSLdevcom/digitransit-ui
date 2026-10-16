import React from 'react';
import Link from 'found/Link';
import { renderWithProviders } from './helpers/mock-providers';
import { mockRouter } from './helpers/mock-router';
import WalkLeg from '../../app/component/itinerary/WalkLeg';
import {
  AlertSeverityLevelType,
  ExtendedRouteTypes,
} from '../../utils/shared/constants';

const renderLink = Link.render;

describe('<WalkLeg />', () => {
  beforeEach(() => {
    vi.spyOn(Link, 'render').mockImplementation(renderLink);
  });

  it.each(['WALK', 'BUS'])(
    'should render a flex arrival as an address without a stop link (%s)',
    mode => {
      const focusAction = vi.fn();
      const flexLeg = {
        mode: 'BUS',
        route: { type: ExtendedRouteTypes.CallAgency },
        from: { name: 'Origin', stop: { gtfsId: 'HSL:origin' } },
        to: {
          name: 'Testikatu 12, Helsinki',
          stop: { gtfsId: 'HSL:flex-area', vehicleMode: 'BUS' },
        },
        start: { scheduledTime: '2026-10-15T09:00:00Z' },
        end: { scheduledTime: '2026-10-15T09:15:00Z' },
        distance: 100,
        duration: 900,
      };
      const leg =
        mode === 'WALK'
          ? {
              ...flexLeg,
              mode,
              route: null,
              from: flexLeg.to,
              to: { name: 'Destination', stop: null },
            }
          : flexLeg;
      const { container, getByRole } = renderWithProviders(
        <WalkLeg
          leg={leg}
          previousLeg={flexLeg}
          index={1}
          focusAction={focusAction}
          focusToLeg={() => {}}
          focusToPoint={() => {}}
        />,
        { router: { ...mockRouter, createHref: to => to } },
      );

      expect(container.querySelector('.address').textContent).toBe(
        'Testikatu 12',
      );
      expect(container.querySelector('.place').textContent).toBe('Helsinki');
      expect(container.querySelector('a')).toBeNull();
      expect(container.querySelector('.itinerary-arrow-icon')).toBeNull();
      getByRole('button', { name: /Testikatu 12, Helsinki/ }).click();
      expect(focusAction).toHaveBeenCalledOnce();
    },
  );

  it('should show the leg starting point name', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      focusToPoint: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: null,
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        start: { scheduledTime: new Date(1529589709000).toISOString() },
        end: { scheduledTime: new Date(1529589701000).toISOString() },
        steps: [
          {
            streetName: 'entrance',
            area: false,
            absoluteDirection: null,
            feature: {
              __typename: 'Entrance',
              publicCode: 'A',
              entranceId: 'osm:123',
              wheelchairAccessible: 'POSSIBLE',
            },
          },
        ],
      },
    };

    const { container } = renderWithProviders(<WalkLeg {...props} />);

    expect(container.querySelector('.itinerary-leg-row').textContent).toContain(
      'Veturitori',
    );
  });

  it('should tell the user to return a rented bike to the starting point station', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      focusToPoint: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: null,
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        start: { scheduledTime: new Date(1529589709000).toISOString() },
        end: { scheduledTime: new Date(1529589701000).toISOString() },
        steps: [
          {
            streetName: 'entrance',
            area: false,
            absoluteDirection: null,
            feature: {
              __typename: 'Entrance',
              publicCode: 'A',
              entranceId: 'osm:123',
              wheelchairAccessible: 'POSSIBLE',
            },
          },
        ],
      },
      previousLeg: {
        distance: 3297.017000000001,
        duration: 904,
        from: {
          name: 'Kaisaniemenpuisto',
          stop: null,
        },
        mode: 'BICYCLE',
        rentedBike: true,
        start: { scheduledTime: new Date(1529588805000).toISOString() },
        end: { scheduledTime: new Date(1529589701000).toISOString() },
        to: {
          name: 'Mannerheimin tie 1',
          stop: null,
        },
      },
    };

    const { container } = renderWithProviders(<WalkLeg {...props} />);

    expect(container.textContent).toContain('Return the bike:');
    expect(container.textContent).toContain('Veturitori');
  });

  it('should show a service alert icon if there is one at the "from" stop', () => {
    const startTime = 1529589709000;
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      focusToPoint: () => {},
      index: 2,
      leg: {
        distance: 284.787,
        duration: 289,
        from: {
          name: 'Veturitori',
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Info,
                effectiveEndDate: startTime / 1000 + 1,
                effectiveStartDate: startTime / 1000 - 1,
              },
            ],
            gtfsId: 'HSL:10000',
          },
        },
        to: {
          name: 'Testipaikka',
          stop: null,
        },
        mode: 'WALK',
        rentedBike: false,
        start: { scheduledTime: new Date(startTime).toISOString() },
        end: { scheduledTime: new Date(1529589701000).toISOString() },
        steps: [
          {
            streetName: 'entrance',
            area: false,
            absoluteDirection: null,
            feature: {
              __typename: 'Entrance',
              publicCode: 'A',
              entranceId: 'osm:123',
              wheelchairAccessible: 'POSSIBLE',
            },
          },
        ],
      },
    };

    const { container } = renderWithProviders(<WalkLeg {...props} />);

    expect(container.querySelector('.info')).not.toBeNull();
  });

  it('should render with leg.{from,to}.stop.vehicleMode being null', () => {
    const props = {
      focusAction: () => {},
      focusToLeg: () => {},
      focusToPoint: () => {},
      index: 1,
      leg: {
        distance: 1.23,
        duration: 34,
        from: {
          name: 'Foo',
          stop: {
            gtfsId: 'foo',
            vehicleMode: null,
          },
        },
        to: {
          name: 'Bar',
          stop: {
            gtfsId: 'bar',
            vehicleMode: null,
          },
        },
        mode: 'WALK',
        rentedBike: false,
        start: { scheduledTime: new Date(1668600030868).toISOString() },
        end: { scheduledTime: new Date(1668600108525).toISOString() },
        steps: [
          {
            streetName: 'entrance',
            area: false,
            absoluteDirection: null,
            feature: {
              __typename: 'Entrance',
              publicCode: 'A',
              entranceId: 'osm:123',
              wheelchairAccessible: 'POSSIBLE',
            },
          },
        ],
      },
    };

    renderWithProviders(<WalkLeg {...props} />);
  });
});
