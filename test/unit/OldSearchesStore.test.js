/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { afterEach, describe, it } from 'mocha';
import MockDate from 'mockdate';
import moment from 'moment';

import OldSearchesStore, {
  STORE_VERSION,
  STORE_PERIOD,
} from '../../app/store/OldSearchesStore';
import {
  getOldSearchesStorage,
  setOldSearchesStorage,
} from '../../app/store/localStorage';

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
    global.localStorage.clear();
  });

  describe('constructor', () => {
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
      const { items, version } = getOldSearchesStorage();
      expect(items).to.be.empty;
      expect(version).to.equal(STORE_VERSION);
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
          {
            type: 'endpoint',
          },
          {
            type: 'route',
          },
          {
            type: 'endpoint',
          },
        ],
      });

      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches('endpoint');
      expect(oldSearches).to.not.be.empty;
      expect(oldSearches.length).to.equal(2);
    });

    it('should filter by timestamp', () => {
      const timestamp = moment('2018-02-18');
      MockDate.set(timestamp);
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [
          {
            item: {
              foo: 'bar',
            },
            lastUpdated: timestamp.unix(),
          },
          {
            item: {
              foo: 'yes',
            },
            lastUpdated: timestamp.unix() - STORE_PERIOD,
          },
          {
            item: {
              foo: 'no',
            },
            lastUpdated: timestamp.unix() - (STORE_PERIOD - 1),
          },
        ],
      });

      const store = new OldSearchesStore();
      const oldSearches = store.getOldSearches();
      expect(oldSearches).to.not.be.empty;
      expect(oldSearches.length).to.equal(2);
      expect(oldSearches.filter(s => s.foo === 'yes')).to.be.empty;
      expect(oldSearches.filter(s => s.foo === 'bar')).to.not.be.empty;
    });

    it('should ignore a missing timestamp', () => {
      const timestamp = moment('2018-02-18');
      MockDate.set(timestamp);
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [{}],
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
      const timestamp = moment('2018-02-18');
      MockDate.set(timestamp);

      const store = new OldSearchesStore();
      store.saveSearch(mockData.updated);
      const storedDestination = getOldSearchesStorage().items[0];
      expect(storedDestination.lastUpdated).to.equal(timestamp.unix());
    });
  });
});
