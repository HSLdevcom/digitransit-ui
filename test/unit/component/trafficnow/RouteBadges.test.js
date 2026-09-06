import React from 'react';
import { shallow } from 'enzyme';
import { createShallowHookSandbox } from '../../helpers/mock-intl-enzyme';
import RouteBadges from '../../../../app/component/trafficnow/RouteBadges';
import RouteBadgeGroup from '../../../../app/component/trafficnow/components/RouteBadgeGroup';
import * as FiltersContext from '../../../../app/component/trafficnow/filters/FiltersContext';
import * as trafficNowUtils from '../../../../app/component/trafficnow/utils';
import { AlertEntityType } from '../../../../app/constants';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9' },
  trafficNowMaxRoutesPerCard: 5,
};

const makeEntity = (type, gtfsId, overrides = {}) => ({
  __typename: type,
  id: gtfsId,
  gtfsId,
  ...overrides,
});

const makeBusRouteGroup = entities => ({
  bus_route: {
    mode: 'bus',
    isRoute: true,
    entities: entities || [
      { id: '1', name: '1', url: '/route/HSL:1', gtfsId: 'HSL:1' },
    ],
  },
});

describe('<RouteBadges />', () => {
  let stubs;
  let filterContextStub;

  beforeEach(() => {
    ({ stubs } = createShallowHookSandbox({ config: baseConfig }));
    filterContextStub = vi
      .spyOn(FiltersContext, 'useFilterContext')
      .mockReturnValue({
        selectedFilters: {},
      });
  });

  describe('All-Unknown entities', () => {
    it('returns null when every entity has __typename Unknown', () => {
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Unknown, 'HSL:2'),
      ];
      const wrapper = shallow(<RouteBadges entities={entities} />);
      expect(wrapper.type()).toBe(null);
    });

    it('does not return null when at least one entity is not Unknown', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Route, 'HSL:2'),
      ];
      const wrapper = shallow(<RouteBadges entities={entities} />);
      expect(wrapper.type()).not.toBe(null);
    });
  });

  describe('RouteBadgeGroup rendering', () => {
    it('renders one RouteBadgeGroup per mode group', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: {
          mode: 'bus',
          isRoute: true,
          entities: [{ id: '1', name: '1', url: '/route/1', gtfsId: 'HSL:1' }],
        },
        tram_route: {
          mode: 'tram',
          isRoute: true,
          entities: [{ id: '2', name: '2', url: '/route/2', gtfsId: 'HSL:2' }],
        },
      });
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup)).toHaveLength(2);
    });

    it('passes isStop=false for route groups', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup).prop('isStop')).toBe(false);
    });

    it('passes isStop=true for stop groups', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_stop: {
          mode: 'bus',
          isRoute: false,
          entities: [
            { id: '1', name: 'Stop A', url: '/stop/HSL:1', gtfsId: 'HSL:1' },
          ],
        },
      });
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Stop, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup).prop('isStop')).toBe(true);
    });

    it('skips groups that have no mode', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: {
          mode: 'bus',
          isRoute: true,
          entities: [{ id: '1', name: '1', url: '/route/1', gtfsId: 'HSL:1' }],
        },
        unknown_route: {
          mode: null,
          isRoute: true,
          entities: [{ id: '2', name: '2', url: '/route/2', gtfsId: 'HSL:2' }],
        },
      });
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup)).toHaveLength(1);
    });

    it('passes each entity mapped to { id, name, url, gtfsId } as routes', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: {
          mode: 'bus',
          isRoute: true,
          entities: [
            {
              id: 'e1',
              name: '99',
              url: '/route/HSL:99',
              gtfsId: 'HSL:99',
              extra: 'ignored',
            },
          ],
        },
      });
      const wrapper = shallow(
        <RouteBadges
          entities={[makeEntity(AlertEntityType.Route, 'HSL:99')]}
        />,
      );
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');
      expect(routes).toHaveLength(1);
      expect(routes[0]).toEqual({
        id: 'e1',
        name: '99',
        url: '/route/HSL:99',
        gtfsId: 'HSL:99',
      });
    });
  });

  describe('highlightedGtfsId from selectedFilters.entity', () => {
    it('passes undefined as highlightedGtfsId when selectedFilters has no entity', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      filterContextStub.mockReturnValue({ selectedFilters: {} });
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup).prop('highlightedGtfsId')).toBe(
        undefined,
      );
    });

    it('passes the entity gtfsId as highlightedGtfsId when selectedFilters.entity is set', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      filterContextStub.mockReturnValue({
        selectedFilters: { entity: { gtfsId: 'HSL:1' } },
      });
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup).prop('highlightedGtfsId')).toBe(
        'HSL:1',
      );
    });
  });

  describe('compact mode', () => {
    const makeRoutes = amount =>
      Array.from({ length: amount }, (_, i) => ({
        id: `e${i}`,
        name: `${i}`,
        url: `/route/HSL:${i}`,
        gtfsId: `HSL:${i}`,
      }));

    it('limits routes to 5 and passes a renderSuffix for the hidden ones', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: { mode: 'bus', isRoute: true, entities: makeRoutes(8) },
      });
      const wrapper = shallow(
        <RouteBadges
          compact
          entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]}
        />,
      );
      const group = wrapper.find(RouteBadgeGroup);
      expect(group.prop('routes')).toHaveLength(5);
      expect(group.prop('renderSuffix')).not.toBe(null);
    });

    it('does not render a suffix when there are 5 or fewer routes', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: { mode: 'bus', isRoute: true, entities: makeRoutes(5) },
      });
      const wrapper = shallow(
        <RouteBadges
          compact
          entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]}
        />,
      );
      const group = wrapper.find(RouteBadgeGroup);
      expect(group.prop('routes')).toHaveLength(5);
      expect(group.prop('renderSuffix')).toBe(null);
    });

    it('uses the configurable trafficNowMaxRoutesPerCard limit', () => {
      stubs.useConfigContext.mockReturnValue({
        ...baseConfig,
        trafficNowMaxRoutesPerCard: 2,
      });
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: { mode: 'bus', isRoute: true, entities: makeRoutes(5) },
      });
      const wrapper = shallow(
        <RouteBadges
          compact
          entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]}
        />,
      );
      const group = wrapper.find(RouteBadgeGroup);
      expect(group.prop('routes')).toHaveLength(2);
      expect(group.prop('renderSuffix')).not.toBe(null);
    });

    it('hides stop groups when a route group exists', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: {
          mode: 'bus',
          isRoute: true,
          entities: [{ id: '1', name: '1', url: '/route/1', gtfsId: 'HSL:1' }],
        },
        bus_stop: {
          mode: 'bus',
          isRoute: false,
          entities: [
            { id: '2', name: 'Stop A', url: '/stop/HSL:2', gtfsId: 'HSL:2' },
          ],
        },
      });
      const wrapper = shallow(
        <RouteBadges
          compact
          entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]}
        />,
      );
      const groups = wrapper.find(RouteBadgeGroup);
      expect(groups).toHaveLength(1);
      expect(groups.prop('isStop')).toBe(false);
    });

    it('still shows stop groups when there are no route groups', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_stop: {
          mode: 'bus',
          isRoute: false,
          entities: [
            { id: '2', name: 'Stop A', url: '/stop/HSL:2', gtfsId: 'HSL:2' },
          ],
        },
      });
      const wrapper = shallow(
        <RouteBadges
          compact
          entities={[makeEntity(AlertEntityType.Stop, 'HSL:2')]}
        />,
      );
      const groups = wrapper.find(RouteBadgeGroup);
      expect(groups).toHaveLength(1);
      expect(groups.prop('isStop')).toBe(true);
    });
  });

  describe('mode filter', () => {
    it('renders only the groups belonging to the given mode', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: {
          mode: 'bus',
          isRoute: true,
          entities: [{ id: '1', name: '1', url: '/route/1', gtfsId: 'HSL:1' }],
        },
        tram_route: {
          mode: 'tram',
          isRoute: true,
          entities: [{ id: '2', name: '4', url: '/route/4', gtfsId: 'HSL:4' }],
        },
      });
      const wrapper = shallow(
        <RouteBadges
          mode="tram"
          entities={[makeEntity(AlertEntityType.Route, 'HSL:4')]}
        />,
      );
      const groups = wrapper.find(RouteBadgeGroup);
      expect(groups).toHaveLength(1);
      expect(groups.prop('mode')).toBe('tram');
    });
  });
});
