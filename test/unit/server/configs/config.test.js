import { getConfiguration, loadAllRawConfigurations } from '../../../../src/server/configs/config';
import defaultConfig from '../../../../src/server/configs/config.default';

describe('config', () => {
  describe('getConfiguration', () => {
    it('should return default configuration without searchParams.boundary.polygon when using no headers', () => {
      const request = { headers: {} };
      const config = getConfiguration(request);
      expect(config.CONFIG).toBe('default');
      expect(config.searchParams['boundary.polygon']).toBeUndefined();
    });

    it('should return hsl configuration with searchParams.boundary.polygon which coordinates are around hsl area when using www.reittiopas.fi as request header', () => {
      const request = { headers: { host: 'www.reittiopas.fi' } };
      const config = getConfiguration(request);

      const boundaryPolygon = config.searchParams['boundary.polygon'].split(' ');

      expect(config.CONFIG).toBe('hsl');
      expect(parseFloat(boundaryPolygon[0])).toBeGreaterThanOrEqual(23);
      // first coordinate is lon
      expect(parseFloat(boundaryPolygon[0])).toBeLessThanOrEqual(26);
      // rest of coordinates are pairs of lat,lon
      for (let i = 1; i < boundaryPolygon.length - 1; i++) {
        const coordinatesSplit = boundaryPolygon[i].split(',');
        expect(parseFloat(coordinatesSplit[0])).toBeGreaterThanOrEqual(59);
        expect(parseFloat(coordinatesSplit[0])).toBeLessThanOrEqual(62);
        expect(parseFloat(coordinatesSplit[1])).toBeGreaterThanOrEqual(23);
        expect(parseFloat(coordinatesSplit[1])).toBeLessThanOrEqual(26);
      }

      expect(parseFloat(boundaryPolygon[boundaryPolygon.length - 1])).toBeGreaterThanOrEqual(59);

      // last coordinate is lat
      expect(parseFloat(boundaryPolygon[boundaryPolygon.length - 1])).toBeLessThanOrEqual(62);
    });
    it('should return default configuration with empty realTimePatch and unchanged realTime.HSL', () => {
      const request = { headers: {} };
      const config = getConfiguration(request);
      expect(config.realTimePatch).toEqual({});
      expect(config.realTime.HSL.mqtt).toBe(defaultConfig.realTime.HSL.mqtt);
    });
  });

  describe('getNamedConfiguration with BASE_CONFIG', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.resetModules();
    });

    it('derives accessiblePrimary and hover from the config own primary color', async () => {
      vi.resetModules();
      vi.stubEnv('BASE_CONFIG', 'default');
      const { getNamedConfiguration } = await import('../../../../src/server/configs/config');
      const baseHover = getNamedConfiguration('default').colors.hover; // fills the base config cache
      const { colors } = getNamedConfiguration('oulu');

      expect(colors.primary).toBe('#e10669');
      expect(colors.accessiblePrimary).toBe('#e10669');
      expect(colors.hover).not.toBe(baseHover);
      expect(getNamedConfiguration('hsl').colors.accessiblePrimary).toBe('#0074be');
    });
  });

  describe('loadAllRawConfigurations', () => {
    it('loads every region config file, but not the shared config.js module', async () => {
      const configs = await loadAllRawConfigurations();
      const names = configs.map(config => config.CONFIG);

      expect(names).toEqual(expect.arrayContaining(['hsl', 'tampere']));
      expect(configs.every(config => typeof config === 'object')).toBe(true);
    });
  });
});
