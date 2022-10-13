/* eslint-disable import/no-extraneous-dependencies */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import uniqByLabel, { formatFavouritePlaceLabel, getNameLabel } from '.';

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
describe('Testing @digitransit-search-util/digitransit-search-util-uniq-by-label module', () => {
  describe('uniqByLabel()', () => {
    it('Checking that returns unique results by label', () => {
      const features = [feature1, feature2, feature3];
      const retValue = uniqByLabel(features);
      expect(retValue.length).to.be.equal(2);
    });

    it('Checking that returns only one result', () => {
      const features = [feature1, feature3];
      const retValue = uniqByLabel(features);
      expect(retValue.length).to.be.equal(1);
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
      expect(output.length).to.equal(2);
      expect(output[0]).to.equal('Koti');
      expect(output[1]).to.equal('Vermonrinne 1, Espoo');
    });
  });

  describe('formatFavouritePlaceLabel(name, address)', () => {
    it('should remove name from address word-wise', () => {
      const output = formatFavouritePlaceLabel(
        'Tietäjä',
        'Tietäjäntie 11, Espoo',
      );
      expect(output.length).to.equal(2);
      expect(output[0]).to.equal('Tietäjä');
      expect(output[1]).to.equal('Tietäjäntie 11, Espoo');
    });

    it('should remove trailing comma and space', () => {
      const output1 = formatFavouritePlaceLabel(
        'Tietäjäntie',
        'Tietäjäntie 11, Espoo',
      );
      expect(output1.length).to.equal(2);
      expect(output1[0]).to.equal('Tietäjäntie');
      expect(output1[1]).to.equal('11, Espoo');

      const output2 = formatFavouritePlaceLabel(
        'Tietäjäntie 11',
        'Tietäjäntie 11, Espoo',
      );
      expect(output2.length).to.equal(2);
      expect(output2[0]).to.equal('Tietäjäntie 11');
      expect(output2[1]).to.equal('Espoo');
    });
  });
});
