import { expect } from 'chai';
import { describe, it } from 'mocha';

import {
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
});
