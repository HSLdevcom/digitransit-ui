import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { sortSearchResults } from '../../app/util/searchUtils';

const config = require('../../app/configurations/config.hsl').default;

describe('searchUtils', () => {
  describe('sortSearchResults', () => {
    let data;

    beforeEach(() => {
      data = [
        {
          properties: {
            confidence: 0.95,
            label: 'testaddress4',
            layer: 'address',
            name: 'testaddress4',
          },
        },
        {
          properties: {
            confidence: 0.25,
            label: 'testaddress2',
            layer: 'address',
            name: 'testaddress2',
          },
        },
        {
          properties: {
            label: 'steissi',
            layer: 'favouriteStation',
            address: 'Rautatieasema, Helsinki',
          },
        },
        {
          properties: {
            label: 'karvis',
            layer: 'favouriteStop',
            address: 'Karvaamokuja 2B, Helsinki',
          },
        },

        {
          properties: {
            label: 'teststation2',
            layer: 'station',
            name: 'teststation2',
            source: 'openstreetmap',
            confidence: 0.95,
          },
        },
        {
          properties: {
            label: 'teststation1',
            layer: 'station',
            name: 'teststation1',
            source: 'gtfshsl',
            confidence: 0.95,
          },
        },
        {
          properties: {
            confidence: 0.75,
            label: 'testaddress 311',
            layer: 'address',
            name: 'testaddress3',
          },
        },
        {
          properties: {
            label: 'Current Position',
            layer: 'currentPosition',
            name: 'currentPosition',
          },
        },
        {
          properties: {
            label: 'Hämeenkyläntie 75, Vantaa',
            layer: 'favouritePlace',
            name: 'suosikki',
          },
        },
        {
          properties: {
            layer: 'route-BUS',
            shortName: '311',
            name: 'route',
          },
        },
        {
          properties: {
            confidence: 0.95,
            label: 'testvenue1',
            layer: 'venue',
            name: 'testvenue1',
          },
        },
        {
          properties: {
            confidence: 0.4,
            label: 'teststop1',
            layer: 'stop',
            name: 'teststop1',
          },
        },
        {
          properties: {
            label: 'test-old-search-no-confidence',
            layer: 'venue',
            name: 'oldsearch',
          },
        },
        {
          properties: {
            confidence: 0.4,
            label: 'testaddress1',
            layer: 'address',
            name: 'testaddress1',
          },
        },
        {
          properties: {
            confidence: 0.4,
            label: 'teststreet1',
            layer: 'street',
            name: 'teststreet1',
          },
        },
      ];

      expect(
        data
          .filter(d =>
            ['address', 'stop', 'street', 'venue'].includes(d.properties.layer),
          )
          .every(d => d.properties.label && d.properties.name),
      ).to.equal(
        true,
        'each address, stop, street and venue should have both labels and names',
      );
    });

    it('should show current position first when search term is empty', () => {
      const results = sortSearchResults(config, data);
      expect(results[0].properties.layer).to.equal('currentPosition');
    });

    it('should show lines first if the search term is a line identifier', () => {
      const term = '311';
      const results = sortSearchResults(config, data, term);
      expect(results[0].properties.layer).to.equal('route-BUS');
    });

    it('should show stations before addresses when confidence is equal', () => {
      const results = sortSearchResults(config, data);
      const stationIndex = results.findIndex(
        r => r.properties.layer === 'station',
      );
      const addressIndex = results.findIndex(
        r => r.properties.layer === 'address',
      );
      expect(stationIndex).to.be.greaterThan(-1);
      expect(addressIndex).to.be.greaterThan(-1);
      expect(addressIndex).to.be.greaterThan(stationIndex);
    });

    it('should show stations with source=gtfshsl before stations with source=openstreetmap ', () => {
      const results = sortSearchResults(config, data);
      const hslIndex = results.findIndex(
        r =>
          r.properties.layer === 'station' && r.properties.source === 'gtfshsl',
      );
      const osmIndex = results.findIndex(
        r =>
          r.properties.layer === 'station' &&
          r.properties.source === 'openstreetmap',
      );
      expect(hslIndex).to.be.greaterThan(-1);
      expect(osmIndex).to.be.greaterThan(-1);
      expect(osmIndex).to.be.greaterThan(hslIndex);
    });

    it('should order addresses, streets and venues by confidence', () => {
      const results = sortSearchResults(
        config,
        data.filter(
          d =>
            (d.properties.layer === 'address' ||
              d.properties.layer === 'street' ||
              d.properties.layer === 'venue') &&
            d.properties.confidence,
        ),
      );
      expect(results.length).to.equal(6);
      expect(results[0].properties.name).to.equal('testaddress4');
      expect(results[1].properties.name).to.equal('testvenue1');
      expect(results[2].properties.name).to.equal('testaddress3');
      expect(results[3].properties.name).to.equal('testaddress1');
      expect(results[4].properties.name).to.equal('teststreet1');
    });

    it('should set direct label match with a favourite first regardless of accents and case', () => {
      const term = 'hameenkylantie 75, vantaa';
      const results = sortSearchResults(
        config,
        data.filter(
          d =>
            d.properties.layer === 'address' ||
            d.properties.layer === 'street' ||
            d.properties.layer === 'venue' ||
            d.properties.layer === 'favouritePlace',
        ),
        term,
      );
      expect(results[0].properties.name).to.equal('suosikki');
    });

    it('should put badly matching favourites after items with confidence', () => {
      const results = sortSearchResults(config, data, 'doesnotmatch');

      const fIndex = results.findIndex(r => r.properties.label === 'steissi');
      const aIndex = results.findIndex(
        r => r.properties.name === 'testaddress1',
      );
      expect(fIndex).to.be.greaterThan(-1);
      expect(aIndex).to.be.greaterThan(-1);
      expect(fIndex).to.be.greaterThan(aIndex);
    });

    it('should rank matching old searches high', () => {
      const results = sortSearchResults(config, data, 'test-old-search');
      expect(
        results.findIndex(r => r.properties.label === 'testaddress4'),
      ).to.be.greaterThan(
        results.findIndex(r => r.properties.name === 'oldsearch'),
      );
    });

    it('should show stops after other items with similar confidence', () => {
      const results = sortSearchResults(config, data);
      const stopIndex = results.findIndex(
        r => r.properties.name === 'teststop1',
      );
      const addrIndex = results.findIndex(
        r => r.properties.name === 'testaddress1',
      );
      expect(stopIndex).to.be.greaterThan(-1);
      expect(addrIndex).to.be.greaterThan(-1);
      expect(stopIndex).to.be.greaterThan(addrIndex);
    });
  });
});
