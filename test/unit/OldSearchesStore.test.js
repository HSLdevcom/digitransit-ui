/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import MockDate from 'mockdate';
import { DateTime } from 'luxon';

import OldSearchesStore, {
  STORE_VERSION,
} from '../../app/store/OldSearchesStore';
import {
  getOldSearchesStorage,
  setOldSearchesStorage,
} from '../../app/store/localStorage';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../app/util/path';

const mockData = {
  old: {
    item: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [25.942728, 61.167738] },
      properties: {
        id: 'way:122595242',
        gid: 'openstreetmap:address:way:122595242',
        layer: 'address',
        source: 'openstreetmap',
        source_id: 'way:122595242',
        name: 'Aleksanterinkatu 52',
        housenumber: '52',
        street: 'Aleksanterinkatu',
        postalcode: '00100',
        postalcode_gid: 'whosonfirst:postalcode:421479570',
        confidence: 0.9456279569892473,
        accuracy: 'point',
        country: 'Suomi',
        country_gid: 'whosonfirst:country:85633144',
        country_a: 'FIN',
        region: 'Uusimaa',
        region_gid: 'whosonfirst:region:85683068',
        localadmin: 'Helsinki',
        localadmin_gid: 'whosonfirst:localadmin:907199716',
        locality: 'Helsinki',
        locality_gid: 'whosonfirst:locality:101748418',
        neighbourhood: 'Kaartinkaupunki',
        neighbourhood_gid: 'whosonfirst:neighbourhood:85907976',
        label: 'Aleksanterinkatu 52, kaakkoinen, Helsinki',
      },
    },
    type: 'endpoint',
  },
  updated: {
    item: {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [24.942728, 60.167738] },
      properties: {
        id: 'way:122595241',
        gid: 'openstreetmap:address:way:122595241',
        layer: 'address',
        source: 'openstreetmap',
        source_id: 'way:122595241',
        name: 'Aleksanterinkatu 52',
        housenumber: '52',
        street: 'Aleksanterinkatu',
        postalcode: '00100',
        postalcode_gid: 'whosonfirst:postalcode:421479569',
        confidence: 0.9368279569892473,
        accuracy: 'point',
        country: 'Suomi',
        country_gid: 'whosonfirst:country:85633143',
        country_a: 'FIN',
        region: 'Uusimaa',
        region_gid: 'whosonfirst:region:85683067',
        localadmin: 'Helsinki',
        localadmin_gid: 'whosonfirst:localadmin:907199715',
        locality: 'Helsinki',
        locality_gid: 'whosonfirst:locality:101748417',
        neighbourhood: 'Kaartinkaupunki',
        neighbourhood_gid: 'whosonfirst:neighbourhood:85907975',
        label: 'Aleksanterinkatu 52, kaakkoinen, Helsinki',
      },
    },
    type: 'endpoint',
  },
};

describe('OldSearchesStore', () => {
  afterEach(() => {
    MockDate.reset();
  });

  describe('getStorageObject()', () => {
    it('should update the local storage to the new version', () => {
      setOldSearchesStorage({
        version: STORE_VERSION - 1,
        items: [
          {
            ...mockData.updated,
            count: 1,
          },
        ],
      });

      const store = new OldSearchesStore();
      store.getStorageObject();

      const { items, version } = getOldSearchesStorage();
      expect(items).to.be.empty;
      expect(version).to.equal(STORE_VERSION);
    });

    it('should persist only the highest-count entry for duplicate routes', () => {
      const routeItem = longName => ({
        type: 'Route',
        geometry: { coordinates: null },
        properties: {
          gtfsId: 'tampere:32',
          shortName: '32',
          longName,
          layer: 'route-BUS',
          mode: 'BUS',
        },
      });
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [
          { count: 1, item: routeItem('Stale Name'), type: 'search' },
          { count: 4, item: routeItem('Current Name'), type: 'search' },
        ],
      });

      const store = new OldSearchesStore();
      store.getStorageObject();

      const { items } = getOldSearchesStorage();
      expect(items).to.have.length(1);
      expect(items[0].count).to.equal(4);
      expect(items[0].item.properties.longName).to.equal('Current Name');
    });
  });

  describe('getOldSearches(type)', () => {
    it('should return an empty array for missing parameters', () => {
      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches();
      expect(oldSearches).to.be.empty;
    });

    it('should return an empty array when no matches are found', () => {
      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches('invalid');
      expect(oldSearches).to.be.empty;
    });

    it('should ignore old version numbers from localStorage', () => {
      setOldSearchesStorage({
        version: 1,
        items: [
          {
            ...mockData.updated,
            count: 1,
          },
        ],
      });

      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches();
      expect(oldSearches).to.be.empty;
    });

    it('should filter by type', () => {
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [
          { item: {}, type: 'endpoint' },
          { item: {}, type: 'route' },
          { item: {}, type: 'endpoint' },
        ],
      });
      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches('endpoint');
      expect(oldSearches).to.not.be.empty;
      expect(oldSearches.length).to.equal(2);
    });

    it('should filter by timestamp', () => {
      const timestamp = () => DateTime.local(2018, 2, 18);
      MockDate.set(timestamp());
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [
          {
            item: {
              foo: 'bar',
            },
            lastUpdated: timestamp().toUnixInteger(),
          },
          {
            item: {
              foo: 'baz',
            },
            lastUpdated: timestamp().plus({ seconds: 1 }).toUnixInteger(),
          },
          {
            item: {
              foo: 'yes_filter',
            },
            lastUpdated: timestamp().minus({ days: 60 }).toUnixInteger(),
          },
          {
            item: {
              foo: 'no_filter',
            },
            lastUpdated: timestamp()
              .minus({ days: 60 })
              .plus({ seconds: 1 })
              .toUnixInteger(),
          },
        ],
      });

      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches();
      expect(oldSearches).to.not.be.empty;
      expect(oldSearches.length).to.equal(3);
      expect(oldSearches.filter(s => s.foo === 'yes_filter')).to.be.empty;
      expect(oldSearches.filter(s => s.foo === 'no_filter')).to.not.be.empty;
    });

    it('should ignore a missing timestamp', () => {
      const timestamp = DateTime.local(2018, 2, 18);
      MockDate.set(timestamp);
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [{ item: {} }],
      });

      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches();
      expect(oldSearches).to.not.be.empty;
      expect(oldSearches.length).to.equal(1);
    });
  });

  describe('saveSearch(destination)', () => {
    it("should update the item's properties if found from store", () => {
      const store = new OldSearchesStore();
      const oldDestination = mockData.old;
      store.saveSearch(oldDestination);
      const storedOldDestination = store.getOldSearches()[0];
      expect(storedOldDestination).to.deep.equal(oldDestination.item);

      const updatedDestination = mockData.updated;
      store.saveSearch(updatedDestination);
      const storedUpdatedDestination = store.getOldSearches()[0];
      expect(storedUpdatedDestination).to.deep.equal(updatedDestination.item);
    });

    it('should apply the current timestamp', () => {
      const timestamp = DateTime.local(2018, 2, 18);
      MockDate.set(timestamp);

      const store = new OldSearchesStore();
      store.saveSearch(mockData.updated);
      const storedDestination = getOldSearchesStorage().items[0];
      expect(storedDestination.lastUpdated).to.equal(timestamp.toUnixInteger());
    });

    it("should update a route item's properties if found from store", () => {
      const oldData = {
        item: {
          type: 'Route',
          properties: {
            gtfsId: 'tampere:32',
            agency: {
              name: 'Tampereen joukkoliikenne',
            },
            shortName: '32',
            mode: 'BUS',
            longName: 'Old Name - Hervanta',
            patterns: [
              {
                code: 'tampere:32:0:01',
              },
              {
                code: 'tampere:32:1:01',
              },
            ],
            layer: 'route-BUS',
            link: `/${PREFIX_ROUTES}/tampere:32/${PREFIX_STOPS}/tampere:32:0:01`,
          },
          geometry: {
            coordinates: null,
          },
        },
        type: 'search',
      };
      const newData = {
        item: {
          type: 'Route',
          properties: {
            gtfsId: 'tampere:32',
            agency: {
              name: 'Tampereen joukkoliikenne',
            },
            shortName: '32',
            mode: 'BUS',
            longName: 'TAYS - Hervanta - Hatanpää-Tampella',
            patterns: [
              {
                code: 'tampere:32:0:01',
              },
              {
                code: 'tampere:32:1:01',
              },
            ],
            layer: 'route-BUS',
            link: `/${PREFIX_ROUTES}/tampere:32/${PREFIX_STOPS}/tampere:32:0:01`,
          },
          geometry: {
            coordinates: null,
          },
        },
        type: 'search',
      };
      const store = new OldSearchesStore();
      store.saveSearch(oldData);
      store.saveSearch(newData);

      const result = store.getOldSearches()[0];
      expect(result).to.deep.equal(newData.item);
    });

    it('should collapse duplicate route entries with the same gtfsId into one', () => {
      const makeRouteEntry = (longName, count) => ({
        count,
        lastUpdated: 1000,
        type: 'search',
        item: {
          type: 'OldSearch',
          properties: {
            gtfsId: 'tampere:32',
            shortName: '32',
            longName,
            layer: 'route-BUS',
            mode: 'BUS',
          },
          geometry: { coordinates: null },
        },
      });

      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [
          makeRouteEntry('Old Name', 5),
          makeRouteEntry('Stale Name', 1),
          makeRouteEntry('Another Stale Name', 1),
        ],
      });

      const store = new OldSearchesStore();
      store.saveSearch({
        type: 'search',
        item: {
          type: 'Route',
          properties: {
            gtfsId: 'tampere:32',
            shortName: '32',
            longName: 'Fresh Name',
            layer: 'route-BUS',
            mode: 'BUS',
          },
          geometry: { coordinates: null },
        },
      });

      const results = store.getOldSearches();
      expect(results.length).to.equal(1);
      expect(results[0].properties.longName).to.equal('Fresh Name');
    });

    it('should inherit the highest count when merging duplicate route entries', () => {
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [
          {
            count: 8,
            lastUpdated: 1000,
            type: 'search',
            item: {
              type: 'Route',
              properties: {
                gtfsId: 'tampere:32',
                shortName: '32',
                longName: 'High Count Entry',
                layer: 'route-BUS',
                mode: 'BUS',
              },
              geometry: { coordinates: null },
            },
          },
          {
            count: 2,
            lastUpdated: 900,
            type: 'search',
            item: {
              type: 'OldSearch',
              properties: {
                gtfsId: 'tampere:32',
                shortName: '32',
                longName: 'Low Count Entry',
                layer: 'route-BUS',
                mode: 'BUS',
              },
              geometry: { coordinates: null },
            },
          },
        ],
      });

      const store = new OldSearchesStore();
      store.saveSearch({
        type: 'search',
        item: {
          type: 'Route',
          properties: {
            gtfsId: 'tampere:32',
            shortName: '32',
            longName: 'Fresh Name',
            layer: 'route-BUS',
            mode: 'BUS',
          },
          geometry: { coordinates: null },
        },
      });

      const storedItems = getOldSearchesStorage().items;
      expect(storedItems.length).to.equal(1);
      expect(storedItems[0].count).to.equal(9); // 8 + 1
    });
  });
});
