import { expect } from 'chai';
import { describe, it } from 'mocha';

import {
  findFeatures,
  isMultiPointTypeGeometry,
  isPointTypeGeometry,
} from '../../../app/util/geo-utils';

const defaultPoint = { lat: 60.1699, lon: 24.9384 };
const polygonFeature = {
  geometry: {
    type: 'Polygon',
    coordinates: [[[24, 60], [24, 61], [25, 61], [25, 60]]],
  },
  properties: {
    name: 'polygonFeature',
  },
};
const multipolygonFeature = {
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [[[10, 20], [20, 20], [10, 10], [20, 10]]],
      [[[24, 60], [24, 61], [25, 61], [25, 60]]],
      [[[30, 40], [40, 40], [30, 30], [40, 30]]],
    ],
  },
  properties: {
    name: 'multiPolygonFeature',
  },
};
const defaultFeatures = [{ ...polygonFeature }, { ...multipolygonFeature }];

describe('geo-utils', () => {
  describe('findFeatures', () => {
    it('should return an empty array if the parameters are not valid', () => {
      expect(
        findFeatures({ ...defaultPoint, lat: NaN }, defaultFeatures),
      ).to.deep.equal([]);
      expect(
        findFeatures({ ...defaultPoint, lon: NaN }, defaultFeatures),
      ).to.deep.equal([]);
      expect(findFeatures({ ...defaultPoint }, undefined)).to.deep.equal([]);
      expect(findFeatures({ ...defaultPoint }, [])).to.deep.equal([]);
    });

    it('should find the point in a Polygon', () => {
      expect(
        findFeatures({ ...defaultPoint }, [{ ...polygonFeature }]),
      ).to.deep.equal([{ name: 'polygonFeature' }]);
    });

    it('should find the point in a MultiPolygon', () => {
      expect(
        findFeatures({ ...defaultPoint }, [{ ...multipolygonFeature }]),
      ).to.deep.equal([{ name: 'multiPolygonFeature' }]);
    });

    it('should find the point in multiple features', () => {
      expect(findFeatures({ ...defaultPoint }, defaultFeatures)).to.deep.equal([
        { name: 'polygonFeature' },
        { name: 'multiPolygonFeature' },
      ]);
    });

    it('should not find the point', () => {
      expect(findFeatures({ lat: 5, lon: 25 }, defaultFeatures)).to.deep.equal(
        [],
      );
    });

    it('should use a custom mapping function', () => {
      expect(
        findFeatures({ ...defaultPoint }, [{ ...polygonFeature }], feature => ({
          foo: 'bar',
          baz: feature.properties.name,
        })),
      ).to.deep.equal([{ foo: 'bar', baz: 'polygonFeature' }]);
    });
  });

  describe('isMultiPointTypeGeometry', () => {
    it('should return false if geometry is falsey', () => {
      expect(isMultiPointTypeGeometry(undefined)).to.equal(false);
    });

    it('should return false if the geometry type does not match', () => {
      expect(isMultiPointTypeGeometry({ type: 'foo' })).to.equal(false);
    });

    it('should return true if the geometry type matches', () => {
      expect(isMultiPointTypeGeometry({ type: 'MultiPoint' })).to.equal(true);
    });
  });

  describe('isPointTypeGeometry', () => {
    it('should return false if geometry is falsey', () => {
      expect(isPointTypeGeometry(undefined)).to.equal(false);
    });

    it('should return false if the geometry type does not match', () => {
      expect(isPointTypeGeometry({ type: 'foo' })).to.equal(false);
    });

    it('should return true if the geometry type matches', () => {
      expect(isPointTypeGeometry({ type: 'Point' })).to.equal(true);
    });
  });
});
