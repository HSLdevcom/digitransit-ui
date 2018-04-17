import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  getOldSearchesStorage,
  setOldSearchesStorage,
} from '../../app/store/localStorage';
import OldSearchesStore from '../../app/store/OldSearchesStore';

global.window = {};
import localStorage from 'mock-local-storage';
window.localStorage = global.localStorage;

describe('OldSearchesStore', () => {
  describe('getOldSearches()', () => {
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

    it("should update the item's properties if found from store", () => {
      const oldDestination = {
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
      };
      const updatedDestination = {
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
      };

      const store = new OldSearchesStore();
      store.saveSearch(oldDestination);
      const storedOldDestination = store.getOldSearches()[0];
      expect(storedOldDestination).to.deep.equal(oldDestination.item);

      store.saveSearch(updatedDestination);
      const storedUpdatedDestination = store.getOldSearches()[0];
      expect(storedUpdatedDestination).to.deep.equal(updatedDestination.item);
    });
  });
});
