import { expect } from 'chai';
import { describe, it } from 'mocha';

import { getConfiguration } from '../../app/config';

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

      const boundaryPolygon = config.searchParams['boundary.polygon'].split(
        ' ',
      );

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

    it('should return default configuration with empty modePolygons object and no modeBoundingBoxes when using no headers', () => {
      const request = {
        headers: {},
      };
      const config = getConfiguration(request);
      expect(config.modePolygons).to.be.empty; // eslint-disable-line no-unused-expressions
      expect(config.modeBoundingBoxes).to.be.undefined; // eslint-disable-line no-unused-expressions
    });

    it('should return hsl configuration with modePolygons and modeBoundingBoxes when using www.reittiopas.fi as request header', () => {
      const request = {
        headers: {
          host: 'www.reittiopas.fi',
        },
      };
      const config = getConfiguration(request);

      const ferryPolygons = config.modePolygons.FERRY;

      expect(ferryPolygons.length).to.equal(1);

      const ferryPolygon = ferryPolygons[0];

      // expect coordinates to be around Suomenlinna
      ferryPolygon.forEach(lonlat => {
        expect(parseFloat(lonlat[0])).to.be.within(24.95759, 25.003767);
        expect(parseFloat(lonlat[1])).to.be.within(60.132316, 60.155);
      });

      const ferryBoundingBoxes = config.modeBoundingBoxes.FERRY;
      expect(ferryBoundingBoxes.length).to.equal(1);

      const ferryBoundingBox = ferryBoundingBoxes[0];

      // Bounding box should have 2 latlon pairs
      expect(ferryBoundingBox.length).to.equal(2);

      // expect coordinates to be around Suomenlinna
      ferryBoundingBox.forEach(latlon => {
        expect(parseFloat(latlon[0])).to.be.within(60.132316, 60.155);
        expect(parseFloat(latlon[1])).to.be.within(24.95759, 25.003767);
      });
    });
  });
});
