import { getConfiguration } from '../../app/config';
import defaultConfig from '../../app/configurations/config.default';

describe('config', () => {
  describe('getConfiguration', () => {
    it('should return default configuration without searchParams.boundary.polygon when using no headers', () => {
      const request = {
        headers: {},
      };
      const config = getConfiguration(request);
      expect(config.CONFIG).toBe('default');
      expect(config.searchParams['boundary.polygon']).toBe(undefined);
    });

    it('should return hsl configuration with searchParams.boundary.polygon which coordinates are around hsl area when using www.reittiopas.fi as request header', () => {
      const request = {
        headers: {
          host: 'www.reittiopas.fi',
        },
      };
      const config = getConfiguration(request);

      const boundaryPolygon =
        config.searchParams['boundary.polygon'].split(' ');

      expect(config.CONFIG).toBe('hsl');
      expect(parseFloat(boundaryPolygon[0])).toBeGreaterThanOrEqual(23);
      expect(parseFloat(boundaryPolygon[0])).toBeLessThanOrEqual(26);
      // rest of coordinates are pairs of lat,lon
      for (let i = 1; i < boundaryPolygon.length - 1; i++) {
        const coordinatesSplit = boundaryPolygon[i].split(',');
        expect(parseFloat(coordinatesSplit[0])).toBeGreaterThanOrEqual(59);
        expect(parseFloat(coordinatesSplit[0])).toBeLessThanOrEqual(62);
        expect(parseFloat(coordinatesSplit[1])).toBeGreaterThanOrEqual(23);
        expect(parseFloat(coordinatesSplit[1])).toBeLessThanOrEqual(26);
      }
      expect(
        parseFloat(boundaryPolygon[boundaryPolygon.length - 1]),
      ).toBeGreaterThanOrEqual(59);
      expect(
        parseFloat(boundaryPolygon[boundaryPolygon.length - 1]),
      ).toBeLessThanOrEqual(62);
    });
    /* eslint-disable no-unused-expressions */
    it('should return default configuration with empty modePolygons object and no modeBoundingBoxes when using no headers', () => {
      const request = {
        headers: {},
      };
      const config = getConfiguration(request);
      expect(config.modePolygons).toEqual({});
      expect(config.modeBoundingBoxes).toBeUndefined();
    });

    /* eslint-disable no-unused-expressions */
    it('should return default configuration with empty realTimePatch and unchanged realTime.HSL', () => {
      const request = {
        headers: {},
      };
      const config = getConfiguration(request);
      expect(config.realTimePatch).toEqual({});
      expect(config.realTime.HSL.mqtt).toBe(defaultConfig.realTime.HSL.mqtt);
    });
  });
});
