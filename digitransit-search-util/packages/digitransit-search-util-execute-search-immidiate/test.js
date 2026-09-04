/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { executeSearch } from './index.js';

// Minimal but complete searchContext stub: getSearchResults() destructures and
// calls most of these unconditionally (or whenever targets/sources are left
// empty, which defaults to "search everything"), so each field has to be
// something callable/iterable even though this test only exercises the
// empty-query path.
const searchContext = {
  getPositions: () => ({}),
  getFavouriteLocations: () => [],
  getOldSearches: () => [],
  getFavouriteStops: () => [],
  parkingAreaSources: [],
  getLanguage: () => 'fi',
  getStopAndStationsQuery: () => Promise.resolve([]),
  getFavouriteVehicleRentalStationsQuery: () => Promise.resolve([]),
  getFavouriteVehicleRentalStations: () => [],
  getFavouriteRoutesQuery: () => Promise.resolve([]),
  getFavouriteRoutes: () => [],
  getRoutesQuery: () => Promise.resolve([]),
  context: {},
  isPeliasLocationAware: false,
  minimalRegexp: undefined,
  lineRegexp: undefined,
  URL_PELIAS: 'https://example.invalid/geocoding',
  URL_PELIAS_PLACE: 'https://example.invalid/place',
  feedIDs: [],
  geocodingSearchParams: {},
  geocodingSources: [],
  getFutureRoutes: () => [],
  cityBikeNetworks: [],
};

describe('Testing @digitransit-search-util/digitransit-search-util-execute-search-immidiate module', () => {
  describe('executeSearch', () => {
    it('calls back synchronously with null to signal that a search has started', () => {
      const calls = [];
      executeSearch(
        [],
        [],
        undefined,
        searchContext,
        undefined,
        undefined,
        { input: '' },
        arg => calls.push(arg),
      );
      expect(calls).to.deep.equal([null]);
    });

    it('resolves an empty query to the "select from map" suggestion', done => {
      const calls = [];
      executeSearch(
        [],
        [],
        undefined,
        searchContext,
        undefined,
        undefined,
        { input: '' },
        result => {
          calls.push(result);
          if (calls.length === 2) {
            expect(result.results).to.have.lengthOf(1);
            expect(result.results[0]).to.include({
              type: 'SelectFromMap',
              address: 'SelectFromMap',
            });
            done();
          }
        },
      );
    });
  });
});
