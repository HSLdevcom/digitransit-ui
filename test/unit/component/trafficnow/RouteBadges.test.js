import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import sinon from 'sinon';
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
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // useFilterContext is stubbed (rather than rendered via a real
    // FilterContextProvider) so each test can control selectedFilters.entity
    // directly without needing to drive real provider state.
    sandbox.stub(FiltersContext, 'useFilterContext').returns({
      selectedFilters: {},
    });
  });

  afterEach(() => sandbox.restore());

  const renderRouteBadges = (props, config = baseConfig) =>
    renderWithProviders(<RouteBadges {...props} />, { config });

  describe('All-Unknown entities', () => {
    it('renders nothing when every entity has __typename Unknown', () => {
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Unknown, 'HSL:2'),
      ];
      const { container } = renderRouteBadges({ entities });
      expect(container.firstChild).to.equal(null);
    });

    it('renders the badges container when at least one entity is not Unknown', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Route, 'HSL:2'),
      ];
      const { container } = renderRouteBadges({ entities });
      expect(container.querySelector('.badges')).to.not.equal(null);
    });
  });

  describe('RouteBadgeGroup rendering', () => {
    it('renders one badge group per mode group', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(container.querySelectorAll('.badges__group')).to.have.lengthOf(2);
    });

    it('renders the mode icon with a "route" (non-stop) class for route groups', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(
        container.querySelector('.badges__group svg.icon.route'),
      ).to.not.equal(null);
      expect(container.querySelector('.badges__group svg.icon.stop')).to.equal(
        null,
      );
    });

    it('renders the mode icon with a "stop" class for stop groups', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      ).to.not.equal(null);
      expect(container.querySelector('.badges__group svg.icon.route')).to.equal(
        null,
      );
    });

    it('skips groups that have no mode', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(container.querySelectorAll('.badges__group')).to.have.lengthOf(1);
    });

    it('renders each entity mapped to its { id, name, url, gtfsId } as a route badge link', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(link).to.not.equal(null);
      expect(link.getAttribute('href')).to.equal('/route/HSL:99');
      expect(link.textContent).to.equal('99');
    });
  });

  describe('highlightedGtfsId from selectedFilters.entity', () => {
    it('does not highlight any badge when selectedFilters has no entity', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      FiltersContext.useFilterContext.returns({ selectedFilters: {} });
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(container.querySelector('.highlight')).to.equal(null);
    });

    it('highlights the badge whose gtfsId matches selectedFilters.entity', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      FiltersContext.useFilterContext.returns({
        selectedFilters: { entity: { gtfsId: 'HSL:1' } },
      });
      const { container } = renderRouteBadges({
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(container.querySelector('a.highlight')).to.not.equal(null);
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
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(badgeContainers).to.have.lengthOf(6);
      expect(badgeContainers[badgeContainers.length - 1].textContent).to.equal(
        '+3',
      );
    });

    it('does not render a suffix badge when there are 5 or fewer routes', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
        bus_route: { mode: 'bus', isRoute: true, entities: makeRoutes(5) },
      });
      const { container } = renderRouteBadges({
        compact: true,
        entities: [makeEntity(AlertEntityType.Route, 'HSL:1')],
      });
      expect(
        container.querySelectorAll('.badges__group .badge-container'),
      ).to.have.lengthOf(5);
    });

    it('uses the configurable trafficNowMaxRoutesPerCard limit', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(badgeContainers).to.have.lengthOf(3);
      expect(badgeContainers[badgeContainers.length - 1].textContent).to.equal(
        '+3',
      );
    });

    it('hides stop groups when a route group exists', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(container.querySelectorAll('.badges__group')).to.have.lengthOf(1);
      expect(
        container.querySelector('.badges__group svg.icon.route'),
      ).to.not.equal(null);
    });

    it('still shows stop groups when there are no route groups', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(container.querySelectorAll('.badges__group')).to.have.lengthOf(1);
      expect(
        container.querySelector('.badges__group svg.icon.stop'),
      ).to.not.equal(null);
    });
  });

  describe('mode filter', () => {
    it('renders only the group belonging to the given mode', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(container.querySelectorAll('.badges__group')).to.have.lengthOf(1);
      expect(
        container.querySelector('.badges__group svg.icon.tram'),
      ).to.not.equal(null);
      expect(container.querySelector('.badges__group a').textContent).to.equal(
        '4',
      );
    });
  });
});
