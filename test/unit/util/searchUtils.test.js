import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import {
  match,
  sortSearchResults,
  getLayerRank,
  isDuplicate,
  routeNameCompare,
} from '../../../app/util/searchUtils';

const config = require('../../../app/configurations/config.hsl').default;

/* Note: unit test data must be configured or applied carefully. For example,
   in real searches, items can have confidence only when search term is given.
 */

describe('searchUtils', () => {
  describe('sortSearchResults', () => {
    let data;
    const lon = 24.9414841;
    const lat = 60.1710688;

    const assignConfidence = (item, term) =>
      item.properties.confidence
        ? {
            ...item,
            properties: {
              ...item.properties,
              confidence: match(term, item.properties),
            },
          }
        : item;

    beforeEach(() => {
      data = [
        {
          properties: {
            confidence: 0.95,
            label: 'testaddress4',
            layer: 'address',
            name: 'testaddress4',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            confidence: 0.25,
            label: 'testaddress2',
            layer: 'address',
            name: 'testaddress2',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'karvis',
            layer: 'favouriteStop',
            address: 'Karvaamokuja 2B, Helsinki',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'teststation2',
            layer: 'station',
            name: 'teststation2',
            source: 'openstreetmap',
            confidence: 0.95,
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'teststation1',
            layer: 'station',
            name: 'teststation1',
            source: 'gtfshsl',
            confidence: 0.95,
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'steissi',
            layer: 'favouriteStation',
            address: 'Rautatieasema, Helsinki',
            gtfsId: 'HSL:1000003',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'this_is_gtfs_duplicate',
            layer: 'station',
            name: 'Rautatientori',
            gtfsId: 'HSL:1000003',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'this_is_duplicate_too_same_addr_and_pos',
            layer: 'favouriteLocation',
            address: 'Rautatieasema, Helsinki',
            name: 'Rautatientori',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            confidence: 0.75,
            label: 'testaddress 311',
            layer: 'address',
            name: 'testaddress3',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'Current Position',
            layer: 'currentPosition',
            name: 'currentPosition',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'hämeenkyläntie 75, vantaa',
            layer: 'favouritePlace',
            name: 'suosikki',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            layer: 'route-BUS',
            shortName: '311',
            name: 'route',
          },
          geometry: { coordinates: null },
        },
        {
          properties: {
            confidence: 0.95,
            label: 'testvenue1',
            layer: 'venue',
            name: 'testvenue1',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            confidence: 0.4,
            label: 'teststop1',
            layer: 'stop',
            name: 'teststop1',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            label: 'test-old-search-no-confidence',
            layer: 'venue',
            name: 'oldsearch',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            confidence: 0.4,
            label: 'testaddress1',
            layer: 'address',
            name: 'testaddress1',
          },
          geometry: { coordinates: [lon, lat] },
        },
        {
          properties: {
            confidence: 0.4,
            label: 'teststreet1',
            layer: 'street',
            name: 'teststreet1',
          },
          geometry: { coordinates: [lon, lat] },
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

    it('should show favourite stations before old station searches', () => {
      const results = sortSearchResults(config, data);
      const favouriteIndex = results.findIndex(
        r => r.properties.name === 'steissi',
      );
      const stationIndex = results.findIndex(
        r => r.properties.name === 'teststation1',
      );
      expect(stationIndex).to.be.greaterThan(favouriteIndex);
    });

    it('should show lines first if the search term is a line identifier', () => {
      const term = '311';
      const results = sortSearchResults(
        config,
        data
          .filter(d => d.properties.layer !== 'currentPosition')
          .map(d => assignConfidence(d, term)),
        term,
      );
      expect(results[0].properties.layer).to.equal('route-BUS');
    });

    it('should show stations before addresses when confidence is not used', () => {
      // empty search term ignores confidence
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

    it('should show stations with gtfs source before stations with source=openstreetmap ', () => {
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
        'foo',
      );
      expect(results.length).to.equal(6);
      expect(results[0].properties.name).to.equal('testaddress4');
      expect(results[1].properties.name).to.equal('testvenue1');
      expect(results[2].properties.name).to.equal('testaddress3');
      expect(results[3].properties.name).to.equal('testaddress1');
      expect(results[4].properties.name).to.equal('teststreet1');
    });

    it('should set direct label match with a favourite first', () => {
      const term = 'hämeenkyläntie 75, vantaa';
      const results = sortSearchResults(
        config,
        data
          .filter(d => d.properties.layer !== 'currentPosition')
          .map(d => assignConfidence(d, term)),
        term,
      );
      expect(results[0].properties.name).to.equal('suosikki');
    });

    it('should put badly matching favourites after items with confidence', () => {
      const results = sortSearchResults(config, data, 'doesnotmatch');
      const favIndex = results.findIndex(r => r.properties.label === 'steissi');
      const addrIndex = results.findIndex(
        r => r.properties.name === 'testvenue1',
      );
      expect(favIndex).to.be.greaterThan(-1);
      expect(addrIndex).to.be.greaterThan(-1);
      expect(favIndex).to.be.greaterThan(addrIndex);
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
      const results = sortSearchResults(config, data, 'foo');
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

    it('should deduplicate gtfs items', () => {
      const results = sortSearchResults(config, data);
      expect(
        results.findIndex(r => r.properties.label === 'this_is_gtfs_duplicate'),
      ).to.equal(-1);
    });

    it('should deduplicate items at same location with an equal name/label/address', () => {
      const results = sortSearchResults(config, data);
      expect(
        results.findIndex(
          r => r.properties.name === 'this_is_duplicate_too_same_addr_and_pos',
        ),
      ).to.equal(-1);
    });
  });

  describe('getLayerRank', () => {
    it('should return 0.4 by default', () => {
      expect(getLayerRank(undefined, undefined)).to.equal(0.4);
    });

    it('should return a greater result for layer station with gtfs source', () => {
      const layer = 'station';
      const nonGtfsSource = getLayerRank(layer, 'foo');
      const gtfsSource = getLayerRank(layer, 'gtfs');
      expect(gtfsSource).to.be.greaterThan(nonGtfsSource);
    });
  });

  describe('match', () => {
    it('should return 0 if the searchTerm is not a string or it is empty', () => {
      const props = {
        name: 'testName',
        label: 'testLabel',
        address: 'testAddress',
        shortName: 'testShortName',
      };
      expect(match(undefined, { ...props })).to.equal(0);
      expect(match(null, { ...props })).to.equal(0);
      expect(match(NaN, { ...props })).to.equal(0);
      expect(match(1234, { ...props })).to.equal(0);
      expect(match([], { ...props })).to.equal(0);
      expect(match({}, { ...props })).to.equal(0);
      expect(match('', { ...props })).to.equal(0);
    });

    it('should match by name', () => {
      const normalizedTerm = 'test';
      const props = {
        name: 'testName',
      };
      const result = match(normalizedTerm, props);
      expect(result).to.be.greaterThan(0);
    });

    it('should match by label', () => {
      const normalizedTerm = 'test';
      const props = {
        label: 'testLabel',
      };
      const result = match(normalizedTerm, props);
      expect(result).to.be.greaterThan(0);
    });

    it('should match by address', () => {
      const normalizedTerm = 'test';
      const props = {
        address: 'testAddress',
      };
      const result = match(normalizedTerm, props);
      expect(result).to.be.greaterThan(0);
    });

    it('should match by shortName', () => {
      const normalizedTerm = 'test';
      const props = {
        shortName: 'testShortName',
      };
      const result = match(normalizedTerm, props);
      expect(result).to.be.greaterThan(0);
    });

    it('should not match by some other property', () => {
      const normalizedTerm = 'test';
      const props = {
        foo: 'testFoo',
      };
      const result = match(normalizedTerm, props);
      expect(result).to.equal(0);
    });

    it('should return a greater result if the match is at start of the string', () => {
      const normalizedTerm = 'test';
      const matchAtStartResult = match(normalizedTerm, {
        name: 'testName',
      });
      const matchSomewhereResult = match(normalizedTerm, {
        name: 'fooBarTestName',
      });
      expect(matchSomewhereResult).to.be.greaterThan(0);
      expect(matchAtStartResult).to.be.greaterThan(matchSomewhereResult);
    });

    it('should return a greater result if the match is longer at start', () => {
      const shortNormalizedTerm = 'test';
      const longNormalizedTerm = 'testfoobar';
      const props = {
        name: 'testFooBar',
      };
      const shortMatchResult = match(shortNormalizedTerm, props);
      const longMatchResult = match(longNormalizedTerm, props);
      expect(shortMatchResult).to.be.greaterThan(0);
      expect(longMatchResult).to.be.greaterThan(shortMatchResult);
    });

    it('should return a greater result if the match is longer at somewhere', () => {
      const shortNormalizedTerm = 'test';
      const longNormalizedTerm = 'testfoobar';
      const props = {
        name: '_testFooBar',
      };
      const shortMatchResult = match(shortNormalizedTerm, props);
      const longMatchResult = match(longNormalizedTerm, props);
      expect(shortMatchResult).to.be.greaterThan(0);
      expect(longMatchResult).to.be.greaterThan(shortMatchResult);
    });
  });

  describe('isDuplicate', () => {
    it('should match by exact gtfsIds', () => {
      const gtfsId = 'foobar';
      const item1 = {
        properties: {
          gtfsId,
        },
      };
      const item2 = {
        properties: {
          gtfsId,
        },
      };
      expect(isDuplicate(item1, item2)).to.equal(true);
    });

    it('should match by item1 gtfsId and item2 gid', () => {
      const item1 = {
        properties: {
          gtfsId: 'foo',
        },
      };
      const item2 = {
        properties: {
          gid: '1234_foo',
        },
      };
      expect(isDuplicate(item1, item2)).to.equal(true);
    });

    it('should match by item2 gtfsId and item1 gid', () => {
      const item1 = {
        properties: {
          gid: '1234_foo',
        },
      };
      const item2 = {
        properties: {
          gtfsId: 'foo',
        },
      };
      expect(isDuplicate(item1, item2)).to.equal(true);
    });

    it('should sort route names correctly', () => {
      const M1 = { shortName: 'M1' };
      const M2 = { shortName: 'M2' };

      expect(routeNameCompare(M1, M1)).to.equal(0);
      expect(routeNameCompare(M1, M2)).to.equal(-1);
      expect(routeNameCompare(M2, M1)).to.equal(1);

      const R1 = { shortName: '7' };
      const R2 = { shortName: '7H' };

      expect(routeNameCompare(R1, R2)).to.equal(-1);

      const L1 = { longName: 'foo' };
      const L2 = { longName: 'bar' };

      expect(routeNameCompare(L1, L2)).to.equal(1);

      const T1 = { shortName: '15' };
      const T2 = { longName: '11' };

      expect(routeNameCompare(T1, T2)).to.equal(1);

      const A1 = { agency: { name: 'länkkäri' } };
      const A2 = { agency: { name: 'paunu' } };

      expect(routeNameCompare(A1, A2)).to.equal(-1);
    });
  });
});
