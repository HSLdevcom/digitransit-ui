import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
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
  let filterContextStub;

  beforeEach(() => {
    ({ sandbox } = createShallowHookSandbox({ config: baseConfig }));
    filterContextStub = sandbox
      .stub(FiltersContext, 'useFilterContext')
      .returns({
        selectedFilters: {},
      });
  });

  afterEach(() => sandbox.restore());

  describe('All-Unknown entities', () => {
    it('returns null when every entity has __typename Unknown', () => {
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Unknown, 'HSL:2'),
      ];
      const wrapper = shallow(<RouteBadges entities={entities} />);
      expect(wrapper.type()).to.equal(null);
    });

    it('does not return null when at least one entity is not Unknown', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      const entities = [
        makeEntity(AlertEntityType.Unknown, 'HSL:1'),
        makeEntity(AlertEntityType.Route, 'HSL:2'),
      ];
      const wrapper = shallow(<RouteBadges entities={entities} />);
      expect(wrapper.type()).to.not.equal(null);
    });
  });

  describe('RouteBadgeGroup rendering', () => {
    it('renders one RouteBadgeGroup per mode group', () => {
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
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup)).to.have.lengthOf(2);
    });

    it('passes isStop=false for route groups', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup).prop('isStop')).to.equal(false);
    });

    it('passes isStop=true for stop groups', () => {
      sandbox.stub(trafficNowUtils, 'groupEntitiesByMode').returns({
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
      expect(wrapper.find(RouteBadgeGroup).prop('isStop')).to.equal(true);
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
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup)).to.have.lengthOf(1);
    });

    it('passes each entity mapped to { id, name, url, gtfsId } as routes', () => {
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
      const wrapper = shallow(
        <RouteBadges
          entities={[makeEntity(AlertEntityType.Route, 'HSL:99')]}
        />,
      );
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');
      expect(routes).to.have.lengthOf(1);
      expect(routes[0]).to.deep.equal({
        id: 'e1',
        name: '99',
        url: '/route/HSL:99',
        gtfsId: 'HSL:99',
      });
    });
  });

  describe('highlightedGtfsId from selectedFilters.entity', () => {
    it('passes undefined as highlightedGtfsId when selectedFilters has no entity', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      filterContextStub.returns({ selectedFilters: {} });
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup).prop('highlightedGtfsId')).to.equal(
        undefined,
      );
    });

    it('passes the entity gtfsId as highlightedGtfsId when selectedFilters.entity is set', () => {
      sandbox
        .stub(trafficNowUtils, 'groupEntitiesByMode')
        .returns(makeBusRouteGroup());
      filterContextStub.returns({
        selectedFilters: { entity: { gtfsId: 'HSL:1' } },
      });
      const wrapper = shallow(
        <RouteBadges entities={[makeEntity(AlertEntityType.Route, 'HSL:1')]} />,
      );
      expect(wrapper.find(RouteBadgeGroup).prop('highlightedGtfsId')).to.equal(
        'HSL:1',
      );
    });
  });
});
