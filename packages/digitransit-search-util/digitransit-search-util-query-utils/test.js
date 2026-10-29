import { describe, it, expect, afterEach } from 'vitest';
import QueryUtilsModule from './lib/index.cjs';

// Unlike digitransit-component-icon/test.js's equivalent note: src/index.js
// has no `export default`, so Rollup's UMD `exports` object has no `default`
// key to unwrap - the whole-object default import (Node's CJS/ESM interop
// binds a default import to the entire UMD `exports` object) already *is*
// the named-exports bag.
const {
  getModesWithAlerts,
  getStopAndStationsQuery,
  getAllVehicleRentalStations,
  filterStopsAndStationsByMode,
  getFavouriteRoutesQuery,
  getFavouriteVehicleRentalStationsQuery,
  getRoutesQuery,
  withCurrentTime,
  filterSearchResultsByMode,
  setRelayEnvironment,
} = QueryUtilsModule;

describe('Testing @digitransit-search-util/digitransit-search-util-query-utils module', () => {
  // These functions all fetch through Relay - without a real Relay
  // environment (network layer, store) there's no way to exercise the
  // fetchQuery branches in a unit test, but each function's own guard clause
  // (no relayEnvironment set, or empty input) is real, unmocked behavior
  // worth asserting on its own.
  afterEach(() => {
    setRelayEnvironment(null);
  });

  describe('without a Relay environment set', () => {
    it('getModesWithAlerts resolves an empty array', () =>
      getModesWithAlerts(0).then(result => {
        expect(result).toEqual([]);
      }));

    it('getStopAndStationsQuery resolves an empty array', () =>
      getStopAndStationsQuery([{ type: 'stop', gtfsId: 'HSL:1234' }]).then(
        result => {
          expect(result).toEqual([]);
        },
      ));

    it('getAllVehicleRentalStations resolves an empty array', () =>
      getAllVehicleRentalStations().then(result => {
        expect(result).toEqual([]);
      }));

    it('filterStopsAndStationsByMode resolves an empty array', () =>
      filterStopsAndStationsByMode(
        [{ gtfsId: 'HSL:1234', properties: { layer: 'stop' } }],
        'BUS',
      ).then(result => {
        expect(result).toEqual([]);
      }));

    it('getFavouriteRoutesQuery resolves an empty array', () =>
      getFavouriteRoutesQuery(['HSL:1234'], '').then(result => {
        expect(result).toEqual([]);
      }));

    it('getFavouriteVehicleRentalStationsQuery resolves an empty array', () =>
      getFavouriteVehicleRentalStationsQuery(
        [{ stationId: 'station1' }],
        '',
      ).then(result => {
        expect(result).toEqual([]);
      }));

    it('getRoutesQuery resolves an empty array', () =>
      getRoutesQuery('55', []).then(result => {
        expect(result).toEqual([]);
      }));
  });

  describe('guard clauses that do not depend on a Relay environment', () => {
    it('filterStopsAndStationsByMode resolves an empty array for an empty input list, even with a Relay environment set', () => {
      setRelayEnvironment({});
      return filterStopsAndStationsByMode([], 'BUS').then(result => {
        expect(result).toEqual([]);
      });
    });

    it('getFavouriteRoutesQuery resolves an empty array for an empty favourites list, even with a Relay environment set', () => {
      setRelayEnvironment({});
      return getFavouriteRoutesQuery([], '').then(result => {
        expect(result).toEqual([]);
      });
    });

    it('getFavouriteVehicleRentalStationsQuery resolves an empty array for an empty favourites list, even with a Relay environment set', () => {
      setRelayEnvironment({});
      return getFavouriteVehicleRentalStationsQuery([], '').then(result => {
        expect(result).toEqual([]);
      });
    });

    it('getRoutesQuery resolves an empty array for a blank search string, even with a Relay environment set', () => {
      setRelayEnvironment({});
      return getRoutesQuery('   ', []).then(result => {
        expect(result).toEqual([]);
      });
    });
  });

  describe('withCurrentTime(location)', () => {
    it('stamps the current time onto a location with no query.time', () => {
      const before = Math.floor(Date.now() / 1000);
      const result = withCurrentTime({ pathname: '/reitti' });
      const after = Math.floor(Date.now() / 1000);
      expect(result.pathname).toBe('/reitti');
      expect(result.query.time).toBeGreaterThanOrEqual(before);
      expect(result.query.time).toBeLessThanOrEqual(after);
    });

    it('leaves an existing query.time untouched', () => {
      const result = withCurrentTime({ query: { time: 123, foo: 'bar' } });
      expect(result.query).toEqual({ time: 123, foo: 'bar' });
    });

    it('handles a location with no query object', () => {
      const result = withCurrentTime(undefined);
      expect(result.query.time).toBeTypeOf('number');
    });
  });

  describe('filterSearchResultsByMode(results, mode, type)', () => {
    const stops = [
      {
        properties: { addendum: { GTFS: { modes: ['BUS', 'TRAM'] } } },
      },
      {
        properties: { addendum: { GTFS: { modes: ['SUBWAY'] } } },
      },
      { properties: {} },
    ];

    it("keeps only stops whose GTFS modes include the given mode, for type 'Stops'", () => {
      expect(filterSearchResultsByMode(stops, 'BUS', 'Stops')).toEqual([
        stops[0],
      ]);
    });

    it("returns results unchanged for type 'Routes'", () => {
      expect(filterSearchResultsByMode(stops, 'BUS', 'Routes')).toBe(stops);
    });

    it("defaults to filtering as 'Stops' when type is omitted", () => {
      expect(filterSearchResultsByMode(stops, 'SUBWAY')).toEqual([stops[1]]);
    });
  });
});
