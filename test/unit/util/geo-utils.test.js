import { expect } from 'chai';
import { describe, it } from 'mocha';

import {
  getClosestPoint,
  isMultiPointTypeGeometry,
  isPointTypeGeometry,
} from '../../../app/util/geo-utils';

describe('geo-utils', () => {
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

  describe('getClosestPoint', () => {
    const a = { lon: 4, lat: 1 };
    const b = { lon: 1, lat: 5 };
    it('should return a if that is closest', () => {
      const c = { lon: 8, lat: 3 };
      const result = getClosestPoint(a, b, c);
      expect(result.lon).to.equal(a.lon);
      expect(result.lat).to.equal(a.lat);
    });
    it('should return b if that is closest', () => {
      const c = { lon: 2, lat: 7 };
      const result = getClosestPoint(a, b, c);
      expect(result.lon).to.equal(b.lon);
      expect(result.lat).to.equal(b.lat);
    });
    it('should return a point between a and b if that is closest', () => {
      const c = { lon: 1, lat: 1 };
      const result = getClosestPoint(a, b, c);
      expect(Math.round(10 * result.lon)).to.equal(29);
      expect(Math.round(10 * result.lat)).to.equal(24);
    });
  });
});
