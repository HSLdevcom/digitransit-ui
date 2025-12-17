import { groupEntitiesByMode } from '../../../app/component/trafficnow/utils';
import { stopPagePath, routePagePath } from '../../../app/util/path';

const mocks = {
  tramRoute: {
    __typename: 'Route',
    gtfsId: 'MATKA:1',
    id: 'TRAM_9',
    mode: 'TRAM',
    shortName: '9',
    __isNode: 'Route',
  },
  busRoute: {
    __typename: 'Route',
    gtfsId: 'MATKA:2',
    id: 'BUS_1',
    mode: 'BUS',
    shortName: '1',
    __isNode: 'Route',
  },
  tramStop: {
    __typename: 'Stop',
    id: 'TRAM_STOP_1',
    name: 'Raitsikkapysäkki',
    code: 'Tr4M_1',
    gtfsId: 'MATKA:3',
    locationType: 'STOP',
    vehicleMode: 'TRAM',
    __isNode: 'Stop',
  },
  busStop: {
    __typename: 'Stop',
    id: 'BUS_STOP_1',
    name: 'Bussipysäkki',
    code: '8u5_1',
    gtfsId: 'MATKA:4',
    locationType: 'STOP',
    vehicleMode: 'BUS',
    __isNode: 'Stop',
  },
  station: {
    __typename: 'Stop',
    id: 'STATION_1',
    name: 'Steissi',
    gtfsId: 'MATKA:5',
    locationType: 'STATION',
    vehicleMode: 'RAIL',
    __isNode: 'Stop',
  },
  railStop: {
    __typename: 'Stop',
    id: 'RAIL_STOP_1',
    name: 'Laituri 1',
    code: 'TR4IN_1',
    gtfsId: 'MATKA:6',
    locationType: 'STOP',
    vehicleMode: undefined,
    platformCode: '1',
    __isNode: 'Stop',
  },
};

const expected = {
  routes: {
    bus_route: {
      mode: 'bus',
      isRoute: true,
      locationType: undefined,
      platformCode: undefined,
      ids: new Set(['BUS_1']),
      entities: [
        {
          id: 'BUS_1',
          name: '1',
          url: routePagePath('MATKA:2'),
          isStop: false,
          isStation: false,
        },
      ],
    },
    tram_route: {
      mode: 'tram',
      isRoute: true,
      locationType: undefined,
      platformCode: undefined,
      ids: new Set(['TRAM_9']),
      entities: [
        {
          id: 'TRAM_9',
          name: '9',
          url: routePagePath('MATKA:1'),
          isStop: false,
          isStation: false,
        },
      ],
    },
  },
  stops: {
    bus_stop: {
      mode: 'bus',
      isRoute: false,
      locationType: 'STOP',
      platformCode: undefined,
      ids: new Set(['BUS_STOP_1']),
      entities: [
        {
          id: 'BUS_STOP_1',
          name: 'Bussipysäkki',
          url: stopPagePath(false, 'MATKA:4'),
          isStop: true,
          isStation: false,
        },
      ],
    },
    tram_stop: {
      mode: 'tram',
      isRoute: false,
      locationType: 'STOP',
      platformCode: undefined,
      ids: new Set(['TRAM_STOP_1']),
      entities: [
        {
          id: 'TRAM_STOP_1',
          name: 'Raitsikkapysäkki',
          url: stopPagePath(false, 'MATKA:3'),
          isStop: true,
          isStation: false,
        },
      ],
    },
    undefined_stop: {
      mode: undefined,
      isRoute: false,
      locationType: 'STOP',
      platformCode: '1',
      ids: new Set(['RAIL_STOP_1']),
      entities: [
        {
          id: 'RAIL_STOP_1',
          name: 'Laituri 1',
          url: stopPagePath(false, 'MATKA:6'),
          isStop: true,
          isStation: false,
        },
      ],
    },
  },
};

describe('trafficNowUtil', () => {
  it('should group tram and bus routes under different groups', () => {
    const grouped = groupEntitiesByMode([mocks.busRoute, mocks.tramRoute], {
      useExtendedRouteTypes: false,
    });
    expect(grouped).to.deep.equal(expected.routes);
  });

  it('should group tram and bus stops and a rail platform under different groups', () => {
    const grouped = groupEntitiesByMode(
      [mocks.busStop, mocks.tramStop, mocks.railStop],
      {
        useExtendedRouteTypes: false,
      },
    );

    expect(grouped).to.deep.equal(expected.stops);
  });

  it('should group tram route and tram stop under same mode but different isRoute', () => {
    const grouped = groupEntitiesByMode([mocks.tramStop, mocks.tramRoute], {
      useExtendedRouteTypes: false,
    });
    expect(grouped).to.have.property('tram_stop');
    expect(grouped).to.have.property('tram_route');
    expect(grouped.tram_stop.entities).to.deep.include({
      id: 'TRAM_STOP_1',
      name: 'Raitsikkapysäkki',
      url: stopPagePath(false, 'MATKA:3'),
      isStop: true,
      isStation: false,
    });
    expect(grouped.tram_route.entities).to.deep.include({
      id: 'TRAM_9',
      name: '9',
      url: routePagePath('MATKA:1'),
      isStop: false,
      isStation: false,
    });
  });

  it('should ignore entities with __typename Unknown', () => {
    const unknownEntity = { __typename: 'Unknown', id: 'X' };
    const grouped = groupEntitiesByMode([unknownEntity, mocks.busRoute], {
      useExtendedRouteTypes: false,
    });
    expect(grouped.bus_route.entities).to.deep.include({
      id: 'BUS_1',
      name: '1',
      url: routePagePath('MATKA:2'),
      isStop: false,
      isStation: false,
    });
    expect(grouped).to.not.have.property('unknown');
  });

  it('should handle station entities correctly', () => {
    const grouped = groupEntitiesByMode([mocks.station], {
      useExtendedRouteTypes: false,
    });
    expect(grouped.rail_stop.entities[0]).to.include({
      id: 'STATION_1',
      name: 'Steissi',
      url: stopPagePath(true, 'MATKA:5'),
      isStop: true,
      isStation: true,
    });
  });

  it('should return empty object for empty input', () => {
    const grouped = groupEntitiesByMode([], { useExtendedRouteTypes: false });
    expect(grouped).to.deep.equal({});
  });

  it('should handle entities with missing mode gracefully', () => {
    const entity = {
      __typename: 'Route',
      gtfsId: 'MATKA:6',
      id: 'UNKNOWN_1',
      shortName: 'X',
      __isNode: 'Route',
    };
    const grouped = groupEntitiesByMode([entity], {
      useExtendedRouteTypes: false,
    });
    expect(grouped).to.be.an('object');
  });
});
