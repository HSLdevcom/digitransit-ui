import collectGeoJsonZones, {
  getZoneUrl,
} from '../../../../server/services/geoJsonZones';

describe('geoJsonZones', () => {
  describe('getZoneUrl', () => {
    it('finds the zone layer by its Finnish or English name and returns its url', () => {
      const json = {
        layers: [
          { name: { fi: 'Muu' }, url: 'https://example.com/other' },
          {
            name: { fi: 'Vyöhykkeet', en: 'Zones' },
            url: 'https://example.com/zones',
          },
        ],
      };
      expect(getZoneUrl(json)).toBe('https://example.com/zones');
    });

    it('returns undefined when noZoneSharing is set', () => {
      const json = {
        noZoneSharing: true,
        layers: [
          { name: { fi: 'Vyöhykkeet' }, url: 'https://example.com/zones' },
        ],
      };
      expect(getZoneUrl(json)).toBeUndefined();
    });

    it('returns undefined when no zone layer is present', () => {
      const json = {
        layers: [{ name: { fi: 'Muu' }, url: 'https://example.com/other' }],
      };
      expect(getZoneUrl(json)).toBeUndefined();
    });
  });

  describe('collectGeoJsonZones (default export)', () => {
    const originalAssembleGeoJson = process.env.ASSEMBLE_GEOJSON;

    afterEach(() => {
      process.env.ASSEMBLE_GEOJSON = originalAssembleGeoJson;
    });

    it('resolves immediately without touching the network when ASSEMBLE_GEOJSON is unset', async () => {
      delete process.env.ASSEMBLE_GEOJSON;
      const result = await collectGeoJsonZones();
      expect(result).toBeUndefined();
    });
  });
});
