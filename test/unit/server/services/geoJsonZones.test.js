import { getZoneUrl } from '../../../../server/services/geoJsonZones';

const { getJson, loadAllRawConfigurations, setAssembledZones } = vi.hoisted(
  () => ({
    getJson: vi.fn(),
    loadAllRawConfigurations: vi.fn(),
    setAssembledZones: vi.fn(),
  }),
);
vi.mock('../../../../utils/shared/xhrPromise', () => ({ getJson }));
vi.mock('../../../../server/configs/config', () => ({
  loadAllRawConfigurations,
  setAssembledZones,
}));

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
    // geoJsonZones.js keeps the first zone layer it sees in module-level
    // state (which getZoneUrl() above also sets), so load a fresh copy of the
    // module for each test.
    const loadCollectGeoJsonZones = async () => {
      vi.resetModules();
      return (await import('../../../../server/services/geoJsonZones')).default;
    };

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('resolves immediately without touching the network when ASSEMBLE_GEOJSON is unset', async () => {
      vi.stubEnv('ASSEMBLE_GEOJSON', '');
      const collectGeoJsonZones = await loadCollectGeoJsonZones();

      await collectGeoJsonZones();

      expect(loadAllRawConfigurations).not.toHaveBeenCalled();
      expect(setAssembledZones).not.toHaveBeenCalled();
    });

    it('combines inline and remote zone urls into the first inline zone layer', async () => {
      vi.stubEnv('ASSEMBLE_GEOJSON', 'true');
      loadAllRawConfigurations.mockResolvedValue([
        { geoJson: { layerConfigUrl: 'https://remote/layers.json' } },
        {},
        {
          geoJson: { layers: [{ name: { fi: 'Vyöhykkeet' }, url: 'inline' }] },
        },
        {
          geoJson: {
            noZoneSharing: true,
            layers: [{ name: { fi: 'Vyöhykkeet' }, url: 'private' }],
          },
        },
      ]);
      getJson.mockResolvedValue({
        geoJson: { layers: [{ name: { en: 'Zones' }, url: 'remote' }] },
      });
      const collectGeoJsonZones = await loadCollectGeoJsonZones();

      await collectGeoJsonZones();

      // The inline layer wins even though the remote config comes first,
      // because remote layers are only seen once their fetch completes.
      expect(setAssembledZones).toHaveBeenCalledWith({
        name: { fi: 'Vyöhykkeet' },
        url: ['remote', 'inline'],
      });
    });

    it('skips remote layer configs that fail to load', async () => {
      vi.stubEnv('ASSEMBLE_GEOJSON', 'true');
      vi.spyOn(console, 'error').mockImplementation(() => {});
      loadAllRawConfigurations.mockResolvedValue([
        { geoJson: { layerConfigUrl: 'https://remote/layers.json' } },
        {
          geoJson: { layers: [{ name: { fi: 'Vyöhykkeet' }, url: 'inline' }] },
        },
      ]);
      getJson.mockRejectedValue(new Error('down'));
      const collectGeoJsonZones = await loadCollectGeoJsonZones();

      await collectGeoJsonZones();

      expect(setAssembledZones).toHaveBeenCalledWith({
        name: { fi: 'Vyöhykkeet' },
        url: ['inline'],
      });
    });
  });
});
