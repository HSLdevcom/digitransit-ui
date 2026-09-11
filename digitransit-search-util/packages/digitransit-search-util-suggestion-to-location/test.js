import { describe, it, expect } from 'vitest';
import suggestionToLocation, { getGTFSId } from './index.js';

describe('Testing @digitransit-search-util/digitransit-search-util-suggestion-to-location module', () => {
  describe('getGTFSId(properties)', () => {
    it('returns the gtfsId field verbatim when present', () => {
      expect(getGTFSId({ gtfsId: 'HSL:1234' })).toBe('HSL:1234');
    });

    it('parses a GTFS: prefixed id without a stop code suffix', () => {
      expect(getGTFSId({ id: 'GTFS:HSL:1234' })).toBe('HSL:1234');
    });

    it("parses a GTFS: prefixed id with a '#code' suffix", () => {
      expect(getGTFSId({ id: 'GTFS:HSL:1234#01' })).toBe('HSL:1234');
    });

    it('returns undefined for a non-GTFS id', () => {
      expect(getGTFSId({ id: 'openaddresses:address:1' })).toBeUndefined();
    });
  });

  describe('suggestionToLocation(item)', () => {
    it('maps a geocoded address suggestion to a location', () => {
      const location = suggestionToLocation({
        type: 'Address',
        geometry: { coordinates: [24.94, 60.17] },
        properties: {
          gid: 'openaddresses:address:12345',
          name: 'Mannerheimintie 1',
          label: 'Mannerheimintie 1, Helsinki',
          layer: 'address',
        },
      });
      expect(location).toEqual({
        gid: 'openaddresses:address:12345',
        address: 'Mannerheimintie 1, Helsinki',
        name: 'Mannerheimintie 1',
        type: 'Address',
        gtfsId: undefined,
        code: undefined,
        layer: 'address',
        lat: 60.17,
        lon: 24.94,
      });
    });

    it('maps a stop suggestion, deriving gtfsId and code from its GTFS id', () => {
      const location = suggestionToLocation({
        type: 'Stop',
        lat: 60.17,
        lon: 24.94,
        properties: {
          id: 'GTFS:HSL:1234#01',
          gid: 'gtfshsl:stop:GTFS:HSL:1234#01',
          name: 'Rautatientori',
          layer: 'stop',
        },
      });
      expect(location).toEqual({
        gid: 'gtfshsl:stop:GTFS:HSL:1234#01',
        address: 'Rautatientori',
        name: 'Rautatientori',
        type: 'Stop',
        gtfsId: 'HSL:1234',
        code: '01',
        layer: 'stop',
        lat: 60.17,
        lon: 24.94,
      });
    });
  });
});
