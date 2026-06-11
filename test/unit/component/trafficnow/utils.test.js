import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import * as modeUtils from '../../../../app/util/modeUtils';
import * as pathUtils from '../../../../app/util/path';
import { AlertEntityType, LocationTypes } from '../../../../app/constants';
import {
  getAvailableModes,
  groupEntitiesByMode,
} from '../../../../app/component/trafficnow/utils';

describe('TrafficNow utils', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getAvailableModes', () => {
    it('returns modes that are available for selection and in TrafficNowTransportModes', () => {
      sandbox.stub(modeUtils, 'getTransportModes').returns({
        BUS: { availableForSelection: true },
        TRAM: { availableForSelection: true },
        CITYBIKE: { availableForSelection: true },
        FERRY: { availableForSelection: false },
      });
      const config = {};
      const modes = getAvailableModes(config);
      expect(modes).to.include('BUS');
      expect(modes).to.include('TRAM');
      // CITYBIKE is not in TrafficNowTransportModes
      expect(modes).to.not.include('CITYBIKE');
      // FERRY is not availableForSelection
      expect(modes).to.not.include('FERRY');
    });

    it('returns all five TrafficNow modes when all are available', () => {
      sandbox.stub(modeUtils, 'getTransportModes').returns({
        bus: { availableForSelection: true },
        ferry: { availableForSelection: true },
        rail: { availableForSelection: true },
        subway: { availableForSelection: true },
        tram: { availableForSelection: true },
      });
      const modes = getAvailableModes({});
      expect(modes).to.deep.equal(['BUS', 'FERRY', 'RAIL', 'SUBWAY', 'TRAM']);
    });

    it('returns an empty array when no modes are available for selection', () => {
      sandbox.stub(modeUtils, 'getTransportModes').returns({
        bus: { availableForSelection: false },
      });
      const modes = getAvailableModes({});
      expect(modes).to.have.length(0);
    });

    it('returns an empty array when config has no transport modes', () => {
      sandbox.stub(modeUtils, 'getTransportModes').returns({});
      const modes = getAvailableModes({});
      expect(modes).to.have.length(0);
    });
  });

  describe('groupEntitiesByMode', () => {
    // Dependencies (getRouteMode, path builders) have their own tests; stub them
    // so these tests focus on groupEntitiesByMode's own grouping/dedup/sort logic.
    // Full real-dependency coverage of grouping lives in util/trafficNowUtil.test.js.
    beforeEach(() => {
      // Return the entity's own mode field (lowercased) when present, mimicking
      // what getRouteMode does for route-shaped objects; return null for stops.
      sandbox
        .stub(modeUtils, 'getRouteMode')
        .callsFake(entity => entity?.mode?.toLowerCase() || null);
      sandbox
        .stub(pathUtils, 'stopPagePath')
        .callsFake((isStation, gtfsId) => `/stop/${gtfsId}`);
      sandbox
        .stub(pathUtils, 'routePagePath')
        .callsFake(gtfsId => `/route/${gtfsId}`);
    });

    it('groups StopOnRoute entities into both route and stop groups', () => {
      const entity = {
        __typename: AlertEntityType.StopOnRoute,
        id: '30',
        gtfsId: 'HSL:30',
        route: { id: 'r1', gtfsId: 'HSL:r1', mode: 'RAIL', shortName: '1' },
        stop: {
          id: 's1',
          gtfsId: 'HSL:s1',
          vehicleMode: 'RAIL',
          name: 'Stop X',
          locationType: LocationTypes.STOP,
        },
        locationType: LocationTypes.STOP,
      };
      const grouped = groupEntitiesByMode([entity], {});
      // StopOnRoute produces two groups: one for the route, one for the stop.
      expect(grouped).to.include.keys('rail_route', 'rail_stop');
    });

    it('deduplicates entities with the same id in the same group', () => {
      const entity = {
        __typename: AlertEntityType.Stop,
        id: '40',
        gtfsId: 'HSL:40',
        vehicleMode: 'BUS',
        locationType: LocationTypes.STOP,
        name: 'Stop D',
      };
      const grouped = groupEntitiesByMode([entity, entity], {});
      expect(grouped.bus_stop.entities).to.have.length(1);
    });

    it('sorts entities within a group alphanumerically by name', () => {
      const entities = [
        {
          __typename: AlertEntityType.Stop,
          id: '1',
          gtfsId: 'HSL:1',
          vehicleMode: 'BUS',
          locationType: LocationTypes.STOP,
          name: 'Zebra stop',
        },
        {
          __typename: AlertEntityType.Stop,
          id: '2',
          gtfsId: 'HSL:2',
          vehicleMode: 'BUS',
          locationType: LocationTypes.STOP,
          name: 'Alpha stop',
        },
        {
          __typename: AlertEntityType.Stop,
          id: '3',
          gtfsId: 'HSL:3',
          vehicleMode: 'BUS',
          locationType: LocationTypes.STOP,
          name: 'Middle stop',
        },
      ];
      const grouped = groupEntitiesByMode(entities, {});
      const names = grouped.bus_stop.entities.map(e => e.name);
      expect(names).to.deep.equal(['Alpha stop', 'Middle stop', 'Zebra stop']);
    });
  });
});
