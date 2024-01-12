import { expect } from 'chai';
import { describe, it } from 'mocha';

import { getConfiguration } from '../../app/config';
import defaultConfig from '../../app/configurations/config.default';

describe('config', () => {
  describe('getConfiguration', () => {
    it('should return default configuration without searchParams.boundary.polygon when using no headers', () => {
      const request = {
        headers: {},
      };
      const config = getConfiguration(request);
      expect(config.CONFIG).to.equal('default');
      expect(config.searchParams['boundary.polygon']).to.equal(undefined);
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

      expect(config.CONFIG).to.equal('hsl');
      // first coordinate is lon
      expect(parseFloat(boundaryPolygon[0])).to.be.within(23, 26);
      // rest of coordinates are pairs of lat,lon
      for (let i = 1; i < boundaryPolygon.length - 1; i++) {
        const coordinatesSplit = boundaryPolygon[i].split(',');
        expect(parseFloat(coordinatesSplit[0])).to.be.within(59, 62);
        expect(parseFloat(coordinatesSplit[1])).to.be.within(23, 26);
      }
      // last coordinate is lat
      expect(
        parseFloat(boundaryPolygon[boundaryPolygon.length - 1]),
      ).to.be.within(59, 62);
    });
    /* eslint-disable no-unused-expressions */
    it('should return default configuration with empty modePolygons object and no modeBoundingBoxes when using no headers', () => {
      const request = {
        headers: {},
      };
      const config = getConfiguration(request);
      expect(config.modePolygons).to.be.empty; // eslint-disable-line no-unused-expressions
      expect(config.modeBoundingBoxes).to.be.undefined; // eslint-disable-line no-unused-expressions
    });

    /* eslint-disable no-unused-expressions */
    it('should return default configuration with empty realTimePatch and unchanged realTime.HSL', () => {
      const request = {
        headers: {},
      };
      const config = getConfiguration(request);
      expect(config.realTimePatch).to.be.empty; // eslint-disable-line no-unused-expressions
      expect(config.realTime.HSL.mqtt).to.equal(
        defaultConfig.realTime.HSL.mqtt,
      ); // eslint-disable-line no-unused-expressions
    });
  });
});
