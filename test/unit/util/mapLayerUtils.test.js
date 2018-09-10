import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as utils from '../../../app/util/mapLayerUtils';

describe('mapLayerUtils', () => {
  describe('isLayerEnabled', () => {
    it('should return false if all underlying features are disabled', () => {
      const mapLayers = {
        stop: {
          bus: false,
          rail: false,
          subway: false,
        },
      };
      const result = utils.isLayerEnabled('stop', mapLayers);
      expect(result).to.equal(false);
    });

    it('should return true if any of the underlying features is enabled', () => {
      const mapLayers = {
        stop: {
          bus: false,
          rail: true,
          subway: false,
        },
      };
      const result = utils.isLayerEnabled('stop', mapLayers);
      expect(result).to.equal(true);
    });

    it('should return false if there are no underlying features and the layer is disabled', () => {
      const mapLayers = {
        citybike: false,
      };
      const result = utils.isLayerEnabled('citybike', mapLayers);
      expect(result).to.equal(false);
    });

    it('should return true if there are no underlying features and the layer is enabled', () => {
      const mapLayers = {
        citybike: true,
      };
      const result = utils.isLayerEnabled('citybike', mapLayers);
      expect(result).to.equal(true);
    });

    it('should return false if the layer does not exist', () => {
      const mapLayers = {
        parkAndRide: true,
      };
      const result = utils.isLayerEnabled('foo', mapLayers);
      expect(result).to.equal(false);
    });

    it('should return false if layerName is falsey', () => {
      const mapLayers = {
        parkAndRide: true,
      };
      const result = utils.isLayerEnabled(undefined, mapLayers);
      expect(result).to.equal(false);
    });

    it('should return false if mapLayers is falsey', () => {
      const mapLayers = undefined;
      const result = utils.isLayerEnabled('ticketSales', mapLayers);
      expect(result).to.equal(false);
    });
  });
});
