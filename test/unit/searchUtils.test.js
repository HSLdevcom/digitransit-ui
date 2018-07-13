import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { sortSearchResults } from '../../app/util/searchUtils';

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
            confidence: 0.5,
            label: 'testaddress1',
            layer: 'address',
            name: 'testaddress1',
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
            label: 'teststation2',
            layer: 'station',
            name: 'teststation2',
            source: 'openstreetmap',
          },
        },
        {
          properties: {
            label: 'teststation1',
            layer: 'station',
            name: 'teststation1',
            source: 'gtfshsl',
          },
        },
        {
          properties: {
            confidence: 0.75,
            label: 'testaddress3',
            layer: 'address',
            name: 'testaddress3',
          },
        },
        {
          properties: {
            confidence: 0.01,
            label: 'Hämeenkyläntie 75, Vantaa',
            layer: 'address',
            name: 'Hämeenkyläntie 75',
          },
        },
        {
          properties: {
            layer: 'route-BUS',
            shortName: '311',
          },
        },
        {
          properties: {
            confidence: 0.85,
            label: 'testvenue1',
            layer: 'venue',
            name: 'testvenue1',
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
        {
          properties: {
            confidence: 0.8,
            label: 'teststop1',
            layer: 'stop',
            name: 'teststop1',
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

    it('should show lines first if the search term is a line identifier', () => {
      const term = '311';
      const results = sortSearchResults(data, term);
      expect(results[0].properties.layer).to.equal('route-BUS');
    });

    it('should show stations before addresses', () => {
      const results = sortSearchResults(data);
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
      const results = sortSearchResults(data);
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
        data.filter(
          d =>
            d.properties.layer === 'address' ||
            d.properties.layer === 'street' ||
            d.properties.layer === 'venue',
        ),
      );
      expect(results.length).to.equal(7);
      expect(results[0].properties.name).to.equal('testaddress4');
      expect(results[1].properties.name).to.equal('testvenue1');
      expect(results[2].properties.name).to.equal('testaddress3');
      expect(results[3].properties.name).to.equal('testaddress1');
      expect(results[4].properties.name).to.equal('teststreet1');
    });

    it('should set direct address label match first, regardless of accents and case', () => {
      const term = 'hameenkylantie 75, vantaa';
      const results = sortSearchResults(
        data.filter(
          d =>
            d.properties.layer === 'address' ||
            d.properties.layer === 'street' ||
            d.properties.layer === 'venue',
        ),
        term,
      );
      expect(results[0].properties.name).to.equal('Hämeenkyläntie 75');
    });

    it('should set direct address name match first, regardless of accents and case', () => {
      const term = 'hameenkylantie 75';
      const results = sortSearchResults(
        data.filter(
          d =>
            d.properties.layer === 'address' ||
            d.properties.layer === 'street' ||
            d.properties.layer === 'venue',
        ),
        term,
      );
      expect(results[0].properties.name).to.equal('Hämeenkyläntie 75');
    });

    it('should not set direct venue label matches first', () => {
      const results = sortSearchResults(
        data.filter(
          d =>
            d.properties.layer === 'address' ||
            d.properties.layer === 'street' ||
            d.properties.layer === 'venue',
        ),
        'testvenue1',
      );
      expect(
        results.findIndex(r => r.properties.label === 'testvenue1'),
      ).to.be.greaterThan(0);
      expect(results[0].properties.name).to.equal('testaddress4');
    });

    it('should not set direct street label matches first', () => {
      const results = sortSearchResults(
        data.filter(
          d =>
            d.properties.layer === 'address' ||
            d.properties.layer === 'street' ||
            d.properties.layer === 'venue',
        ),
        'teststreet1',
      );
      expect(
        results.findIndex(r => r.properties.label === 'teststreet1'),
      ).to.be.greaterThan(0);
      expect(results[0].properties.name).to.equal('testaddress4');
    });

    it('should show stops last', () => {
      const results = sortSearchResults(data);
      expect(results[results.length - 1].properties.layer).to.equal('stop');
    });
  });
});
