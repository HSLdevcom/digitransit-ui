import * as modeUtils from '../../../../app/util/modeUtils';
import * as pathUtils from '../../../../app/util/path';
import { AlertEntityType, LocationTypes } from '../../../../app/constants';
import {
  getAvailableModes,
  groupEntitiesByMode,
  getAlertModes,
  buildDisruptionCards,
} from '../../../../app/component/trafficnow/utils';

describe('TrafficNow utils', () => {
  beforeEach(() => {});

  afterEach(() => {});

  describe('getAvailableModes', () => {
    it('returns modes that are available for selection and in TrafficNowTransportModes', () => {
      vi.spyOn(modeUtils, 'getTransportModes').mockReturnValue({
        BUS: { availableForSelection: true },
        TRAM: { availableForSelection: true },
        CITYBIKE: { availableForSelection: true },
        FERRY: { availableForSelection: false },
      });
      const config = {};
      const modes = getAvailableModes(config);
      expect(modes).toContain('BUS');
      expect(modes).toContain('TRAM');
      expect(modes).not.toContain('CITYBIKE');
      expect(modes).not.toContain('FERRY');
    });

    it('returns all five TrafficNow modes when all are available', () => {
      vi.spyOn(modeUtils, 'getTransportModes').mockReturnValue({
        bus: { availableForSelection: true },
        ferry: { availableForSelection: true },
        rail: { availableForSelection: true },
        subway: { availableForSelection: true },
        tram: { availableForSelection: true },
      });
      const modes = getAvailableModes({});
      expect(modes).toEqual(['BUS', 'FERRY', 'RAIL', 'SUBWAY', 'TRAM']);
    });

    it('returns an empty array when no modes are available for selection', () => {
      vi.spyOn(modeUtils, 'getTransportModes').mockReturnValue({
        bus: { availableForSelection: false },
      });
      const modes = getAvailableModes({});
      expect(modes).toHaveLength(0);
    });

    it('returns an empty array when config has no transport modes', () => {
      vi.spyOn(modeUtils, 'getTransportModes').mockReturnValue({});
      const modes = getAvailableModes({});
      expect(modes).toHaveLength(0);
    });
  });

  describe('groupEntitiesByMode', () => {
    // Dependencies (getRouteMode, path builders) have their own tests; stub them
    // so these tests focus on groupEntitiesByMode's own grouping/dedup/sort logic.
    // Full real-dependency coverage of grouping lives in util/trafficNowUtil.test.js.
    beforeEach(() => {
      // Return the entity's own mode field (lowercased) when present, mimicking
      // what getRouteMode does for route-shaped objects; return null for stops.
      vi.spyOn(modeUtils, 'getRouteMode').mockImplementation(
        entity => entity?.mode?.toLowerCase() || null,
      );
      vi.spyOn(pathUtils, 'stopPagePath').mockImplementation(
        (isStation, gtfsId) => `/stop/${gtfsId}`,
      );
      vi.spyOn(pathUtils, 'routePagePath').mockImplementation(
        gtfsId => `/route/${gtfsId}`,
      );
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
      expect(Object.keys(grouped)).toEqual(
        expect.arrayContaining(['rail_route', 'rail_stop']),
      );
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
      expect(grouped.bus_stop.entities).toHaveLength(1);
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
      expect(names).toEqual(['Alpha stop', 'Middle stop', 'Zebra stop']);
    });
  });

  describe('getAlertModes', () => {
    beforeEach(() => {
      vi.spyOn(modeUtils, 'getRouteMode').mockImplementation(
        entity => entity?.mode?.toLowerCase() || null,
      );
      vi.spyOn(pathUtils, 'stopPagePath').mockImplementation(
        (isStation, gtfsId) => `/stop/${gtfsId}`,
      );
      vi.spyOn(pathUtils, 'routePagePath').mockImplementation(
        gtfsId => `/route/${gtfsId}`,
      );
    });

    it('returns each route mode once, ignoring stop groups of the same mode', () => {
      const entities = [
        {
          __typename: AlertEntityType.Route,
          id: 'r1',
          gtfsId: 'HSL:r1',
          mode: 'BUS',
          shortName: '1',
        },
        {
          __typename: AlertEntityType.Stop,
          id: 's1',
          gtfsId: 'HSL:s1',
          vehicleMode: 'BUS',
          locationType: LocationTypes.STOP,
          name: 'Stop A',
        },
        {
          __typename: AlertEntityType.Route,
          id: 'r2',
          gtfsId: 'HSL:r2',
          mode: 'TRAM',
          shortName: '4',
        },
      ];
      expect(getAlertModes(entities, {})).toEqual(['bus', 'tram']);
    });

    it('omits stop-only modes when the alert has any route information', () => {
      const entities = [
        {
          __typename: AlertEntityType.Route,
          id: 'r1',
          gtfsId: 'HSL:r1',
          mode: 'BUS',
          shortName: '1',
        },
        {
          __typename: AlertEntityType.Stop,
          id: 's1',
          gtfsId: 'HSL:s1',
          vehicleMode: 'TRAM',
          locationType: LocationTypes.STOP,
          name: 'Stop A',
        },
      ];
      expect(getAlertModes(entities, {})).toEqual(['bus']);
    });

    it('returns stop modes only when the alert has no routes at all', () => {
      const entities = [
        {
          __typename: AlertEntityType.Stop,
          id: 's1',
          gtfsId: 'HSL:s1',
          vehicleMode: 'BUS',
          locationType: LocationTypes.STOP,
          name: 'Stop A',
        },
        {
          __typename: AlertEntityType.Stop,
          id: 's2',
          gtfsId: 'HSL:s2',
          vehicleMode: 'TRAM',
          locationType: LocationTypes.STOP,
          name: 'Stop B',
        },
      ];
      expect(getAlertModes(entities, {})).toEqual(['bus', 'tram']);
    });

    it('returns an empty array when entities are null', () => {
      expect(getAlertModes(null, {})).toEqual([]);
    });
  });

  describe('buildDisruptionCards', () => {
    beforeEach(() => {
      vi.spyOn(modeUtils, 'getRouteMode').mockImplementation(
        entity => entity?.mode?.toLowerCase() || null,
      );
      vi.spyOn(pathUtils, 'stopPagePath').mockImplementation(
        (isStation, gtfsId) => `/stop/${gtfsId}`,
      );
      vi.spyOn(pathUtils, 'routePagePath').mockImplementation(
        gtfsId => `/route/${gtfsId}`,
      );
    });

    const makeAlert = (id, entityMode) => ({
      id,
      entities: entityMode
        ? [
            {
              __typename: AlertEntityType.Route,
              id: `r-${id}`,
              gtfsId: `HSL:r-${id}`,
              mode: entityMode,
              shortName: id,
            },
          ]
        : [],
    });

    it('produces one card per mode when no filter is active', () => {
      const alert = {
        id: 'a1',
        entities: [
          {
            __typename: AlertEntityType.Route,
            id: 'r1',
            gtfsId: 'HSL:r1',
            mode: 'BUS',
            shortName: '1',
          },
          {
            __typename: AlertEntityType.Route,
            id: 'r2',
            gtfsId: 'HSL:r2',
            mode: 'TRAM',
            shortName: '4',
          },
        ],
      };
      const cards = buildDisruptionCards([alert], {}, {});
      expect(cards).toHaveLength(2);
      expect(cards.map(c => c.mode)).toEqual(['bus', 'tram']);
      expect(cards.map(c => c.key)).toEqual(['a1-bus', 'a1-tram']);
    });

    it('keeps only the selected modes when vehicleModes filter is active', () => {
      const busAlert = makeAlert('a1', 'BUS');
      const tramAlert = makeAlert('a2', 'TRAM');
      const cards = buildDisruptionCards(
        [busAlert, tramAlert],
        { vehicleModes: ['bus'] },
        {},
      );
      expect(cards).toHaveLength(1);
      expect(cards[0].mode).toBe('bus');
    });

    it('limits cards to the mode containing the selected entity', () => {
      const alert = {
        id: 'a1',
        entities: [
          {
            __typename: AlertEntityType.Route,
            id: 'r1',
            gtfsId: 'HSL:r1',
            mode: 'BUS',
            shortName: '1',
          },
          {
            __typename: AlertEntityType.Route,
            id: 'r2',
            gtfsId: 'HSL:r2',
            mode: 'TRAM',
            shortName: '4',
          },
        ],
      };
      const cards = buildDisruptionCards(
        [alert],
        { entity: { gtfsId: 'HSL:r1' } },
        {},
      );
      expect(cards).toHaveLength(1);
      expect(cards[0].mode).toBe('bus');
    });

    it('limits cards to modes containing at least one favourite', () => {
      const alert = {
        id: 'a1',
        entities: [
          {
            __typename: AlertEntityType.Route,
            id: 'r1',
            gtfsId: 'HSL:r1',
            mode: 'BUS',
            shortName: '1',
          },
          {
            __typename: AlertEntityType.Route,
            id: 'r2',
            gtfsId: 'HSL:r2',
            mode: 'TRAM',
            shortName: '4',
          },
        ],
      };
      const cards = buildDisruptionCards(
        [alert],
        { favourites: new Set(['HSL:r2']) },
        {},
      );
      expect(cards).toHaveLength(1);
      expect(cards[0].mode).toBe('tram');
    });

    it('produces a single card with mode=undefined for an alert with no recognised mode', () => {
      const alert = { id: 'a1', entities: [] };
      const cards = buildDisruptionCards([alert], {}, {});
      expect(cards).toHaveLength(1);
      expect(cards[0]).toMatchObject({ key: 'a1', mode: undefined, alert });
    });

    it('still produces a no-mode card even when a mode filter is active', () => {
      const alert = { id: 'a1', entities: [] };
      const cards = buildDisruptionCards(
        [alert],
        { vehicleModes: ['bus'] },
        {},
      );
      expect(cards).toHaveLength(1);
      expect(cards[0].mode).toBe(undefined);
    });

    it('returns an empty array when disruptions is empty', () => {
      expect(buildDisruptionCards([], {}, {})).toEqual([]);
    });
  });
});
