import { describe, it, expect } from 'vitest';
import uniqByLabel, { formatFavouritePlaceLabel, getNameLabel } from './index';

const feature1 = {
  properties: {
    id: 1,
    layer: 'route-BUS',
    labelId: 'id',
    address: 'address',
    shortName: 'sht',
    mode: 'moude',
    longName: 'short',
    agency: { name: 'test' },
    label: 'test',
  },
};

const feature2 = {
  properties: {
    id: 2,
    layer: 'route-BUS',
    labelId: 'id2',
    address: 'address4',
    shortName: 'shta',
    mode: 'moudew',
    longName: 'shorta',
    agency: { name: 'test' },
    label: 'teset',
  },
};

const feature3 = {
  properties: {
    id: 1,
    layer: 'route-BUS',
    labelId: 'id',
    address: 'address',
    shortName: 'sht',
    mode: 'moude',
    longName: 'short',
    agency: { name: 'test' },
    label: 'test',
  },
};

const testdata = {
  stop: {
    accuracy: 'centroid',
    confidence: 0.542497680890538,
    country: 'Suomi',
    country_a: 'FIN',
    country_gid: 'whosonfirst:country:85633143',
    gid: 'gtfshsl:stop:GTFS:HSL:1293163#1636',
    id: 'GTFS:HSL:1293163#1636',
    label: 'Teuvo Pakkalan tie 1636, Pohjois-Haaga, Helsinki',
    layer: 'stop',
    localadmin: 'Helsinki',
    localadmin_gid: 'whosonfirst:localadmin:907199715',
    locality: 'Helsinki',
    locality_gid: 'whosonfirst:locality:101748417',
    name: 'Teuvo Pakkalan tie 1636',
    neighbourhood: 'Pohjois-Haaga',
    neighbourhood_gid: 'whosonfirst:neighbourhood:85907969',
    postalcode: '00400',
    postalcode_gid: 'whosonfirst:postalcode:421473047',
    region: 'Uusimaa',
    region_gid: 'whosonfirst:region:85683067',
    source: 'gtfshsl',
    source_id: 'gtfs:hsl:1293163#1636',
  },
};

describe('Testing @digitransit-search-util/digitransit-search-util-uniq-by-label module', () => {
  describe('uniqByLabel()', () => {
    it('Checking that returns unique results by label', () => {
      const features = [feature1, feature2, feature3];
      const retValue = uniqByLabel(features);
      expect(retValue.length).toBe(2);
    });

    it('Checking that returns only one result', () => {
      const features = [feature1, feature3];
      const retValue = uniqByLabel(features);
      expect(retValue.length).toBe(1);
    });
  });

  describe('getNameLabel(', () => {
    it('should format "favouritePlace" suggestion', () => {
      // fixture data
      const testSuggestionProps1 = {
        layer: 'favouritePlace',
        address: 'Vermonrinne 1, Espoo',
        favouriteId: '752885cd-d095-4b48-9eb1-9ceaf89d3b3c',
        gid: 'openstreetmap:address:way:962197579',
        label: 'Koti',
        lastUpdated: 1652881635,
        lat: 60.188342,
        lon: 24.803862,
        selectedIconId: 'icon-icon_home',
        name: 'Koti',
        type: 'place',
      };

      const output = getNameLabel(testSuggestionProps1);
      expect(output.length).toBe(2);
      expect(output[0]).toBe('Koti');
      expect(output[1]).toBe('Vermonrinne 1, Espoo');
    });

    it('should include locality in plaintext gtfs stop label', () => {
      const label = getNameLabel(testdata.stop, true);
      expect(label[1]).toBe('Helsinki');
    });

    it('should include agency in the plaintext for routes', () => {
      const properties = {
        agency: { name: 'Tampereen joukkoliikenne' },
        layer: 'route-BUS',
        longName: 'TAYS - Hervanta - Hatanpää-Tampella',
        shortName: '32',
      };

      const label = getNameLabel(properties, true);
      expect(label).toEqual([
        '32',
        'TAYS - Hervanta - Hatanpää-Tampella',
        'Tampereen joukkoliikenne',
      ]);
    });

    it('should ignore a missing agency in the plaintext for routes', () => {
      const properties = {
        agency: null,
        layer: 'route-BUS',
        longName: 'TAYS - Hervanta - Hatanpää-Tampella',
        shortName: '32',
      };

      const label = getNameLabel(properties, true);
      expect(label).toEqual(['32', 'TAYS - Hervanta - Hatanpää-Tampella', undefined]);
    });
  });

  describe('formatFavouritePlaceLabel(name, address)', () => {
    it('should remove name from address word-wise', () => {
      const output = formatFavouritePlaceLabel('Tietäjä', 'Tietäjäntie 11, Espoo');
      expect(output.length).toBe(2);
      expect(output[0]).toBe('Tietäjä');
      expect(output[1]).toBe('Tietäjäntie 11, Espoo');
    });

    it('should remove trailing comma and space', () => {
      const output1 = formatFavouritePlaceLabel('Tietäjäntie', 'Tietäjäntie 11, Espoo');
      expect(output1.length).toBe(2);
      expect(output1[0]).toBe('Tietäjäntie');
      expect(output1[1]).toBe('11, Espoo');

      const output2 = formatFavouritePlaceLabel('Tietäjäntie 11', 'Tietäjäntie 11, Espoo');
      expect(output2.length).toBe(2);
      expect(output2[0]).toBe('Tietäjäntie 11');
      expect(output2[1]).toBe('Espoo');
    });
  });
});
