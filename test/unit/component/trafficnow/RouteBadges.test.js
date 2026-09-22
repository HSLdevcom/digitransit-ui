import { describe, it, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderWithProviders } from '../../helpers/mock-providers';
import RouteBadges from '../../../../app/component/trafficnow/RouteBadges';
import * as FiltersContext from '../../../../app/component/trafficnow/filters/FiltersContext';
import * as trafficNowUtils from '../../../../app/component/trafficnow/utils';
import { AlertEntityType } from '../../../../utils/shared/constants';

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
  beforeEach(() => {
    // sinon can't stub this repo's own ESM exports (the binding read by real
    // importers stays live/un-replaced), so useFilterContext/
    // groupEntitiesByMode use vi.spyOn instead (auto-restored via the
    // `restoreMocks: true` Vitest config option) rather than being rendered
    // via a real FilterContextProvider, so each test can control
    // selectedFilters.entity directly without needing to drive real
    // provider state.
    vi.spyOn(FiltersContext, 'useFilterContext').mockReturnValue({
      selectedFilters: {},
    });
  });

  const renderRouteBadges = (props, config = baseConfig) =>
    renderWithProviders(<RouteBadges {...props} />, { config });

  describe('All-Unknown entities', () => {
    it('renders nothing when every entity has __typename Unknown', () => {
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Unknown, 'HSL:2'),
      ];
      const { container } = renderRouteBadges({ entities });
      expect(container.firstChild).toBeNull();
    });

    it('renders the badges container when at least one entity is not Unknown', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Route, 'HSL:2'),
      ];
      const { container } = renderRouteBadges({ entities });
      expect(container.querySelector('.badges')).not.toBeNull();
    });
  });

  describe('RouteBadgeGroup rendering', () => {
    it('renders one badge group per mode group', () => {
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
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(container.querySelectorAll('.badges__group')).toHaveLength(2);
    });

    it('renders the mode icon with a "route" (non-stop) class for route groups', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(
        container.querySelector('.badges__group svg.icon.route'),
      ).not.toBeNull();
      expect(
        container.querySelector('.badges__group svg.icon.stop'),
      ).toBeNull();
    });

    it('renders the mode icon with a "stop" class for stop groups', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_stop: {
          mode: 'bus',
          isRoute: false,
          entities: [
            { id: '1', name: 'Stop A', url: '/stop/HSL:1', gtfsId: 'HSL:1' },
          ],
        },
      });
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Stop, 'HSL:1')],
      });
      expect(
        container.querySelector('.badges__group svg.icon.stop'),
      ).not.toBeNull();
      expect(
        container.querySelector('.badges__group svg.icon.route'),
      ).toBeNull();
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
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(container.querySelectorAll('.badges__group')).toHaveLength(1);
    });

    it('renders each entity mapped to its { id, name, url, gtfsId } as a route badge link', () => {
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
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:99')],
      });
      const link = container.querySelector('.badges__group a');
      expect(link).not.toBeNull();
      expect(link.getAttribute('href')).toBe('/route/HSL:99');
      expect(link.textContent).toBe('99');
    });
  });

  describe('highlightedGtfsId from selectedFilters.entity', () => {
    it('does not highlight any badge when selectedFilters has no entity', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      FiltersContext.useFilterContext.mockReturnValue({ selectedFilters: {} });
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(container.querySelector('.highlight')).toBeNull();
    });

    it('highlights the badge whose gtfsId matches selectedFilters.entity', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue(
        makeBusRouteGroup(),
      );
      FiltersContext.useFilterContext.mockReturnValue({
        selectedFilters: { entity: { gtfsId: 'HSL:1' } },
      });
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(container.querySelector('a.highlight')).not.toBeNull();
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

    it('limits routes to 5 and renders a "+N" suffix badge for the hidden ones', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: { mode: 'bus', isRoute: true, entities: makeRoutes(8) },
      });
      const { container } = renderRouteBadges({
        compact: true,
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      const badgeContainers = container.querySelectorAll(
        '.badges__group .badge-container',
      );
      // 5 visible route badges + 1 "+N" suffix badge.
      expect(badgeContainers).toHaveLength(6);
      expect(badgeContainers[badgeContainers.length - 1].textContent).toBe(
        '+3',
      );
    });

    it('does not render a suffix badge when there are 5 or fewer routes', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: { mode: 'bus', isRoute: true, entities: makeRoutes(5) },
      });
      const { container } = renderRouteBadges({
        compact: true,
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(
        container.querySelectorAll('.badges__group .badge-container'),
      ).toHaveLength(5);
    });

    it('uses the configurable trafficNowMaxRoutesPerCard limit', () => {
      vi.spyOn(trafficNowUtils, 'groupEntitiesByMode').mockReturnValue({
        bus_route: { mode: 'bus', isRoute: true, entities: makeRoutes(5) },
      });
      const { container } = renderRouteBadges(
        {
          compact: true,
          entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
        },
        { ...baseConfig, trafficNowMaxRoutesPerCard: 2 },
      );
      const badgeContainers = container.querySelectorAll(
        '.badges__group .badge-container',
      );
      // 2 visible route badges + 1 "+3" suffix badge.
      expect(badgeContainers).toHaveLength(3);
      expect(badgeContainers[badgeContainers.length - 1].textContent).toBe(
        '+3',
      );
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
      const { container } = renderRouteBadges({
        compact: true,
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(container.querySelectorAll('.badges__group')).toHaveLength(1);
      expect(
        container.querySelector('.badges__group svg.icon.route'),
      ).not.toBeNull();
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
      const { container } = renderRouteBadges({
        compact: true,
        entities: [makeEntity(AlertEntityType.Stop, 'HSL:2')],
      });
      expect(container.querySelectorAll('.badges__group')).toHaveLength(1);
      expect(
        container.querySelector('.badges__group svg.icon.stop'),
      ).not.toBeNull();
    });
  });

  describe('mode filter', () => {
    it('renders only the group belonging to the given mode', () => {
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
      const { container } = renderRouteBadges({
        mode: 'tram',
        entities: [makeEntity(AlertEntityType.Route, 'HSL:4')],
      });
      expect(container.querySelectorAll('.badges__group')).toHaveLength(1);
      expect(
        container.querySelector('.badges__group svg.icon.tram'),
      ).not.toBeNull();
      expect(container.querySelector('.badges__group a').textContent).toBe('4');
    });
  });
});
