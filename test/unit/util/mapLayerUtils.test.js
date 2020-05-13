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

  describe('isFeatureLayerEnabled', () => {
    it('should return false if feature is falsey', () => {
      const feature = undefined;
      const layerName = 'citybike';
      const mapLayers = {
        citybike: true,
      };

      const result = utils.isFeatureLayerEnabled(feature, layerName, mapLayers);
      expect(result).to.equal(false);
    });

    it('should return false if layerName is falsey', () => {
      const feature = {
        properties: {
          type: 'BUS',
        },
      };
      const layerName = undefined;
      const mapLayers = {
        citybike: true,
      };

      const result = utils.isFeatureLayerEnabled(feature, layerName, mapLayers);
      expect(result).to.equal(false);
    });

    it('should return false if mapLayers is falsey', () => {
      const feature = {
        properties: {
          type: 'BUS',
        },
      };
      const layerName = 'stop';
      const mapLayers = undefined;

      const result = utils.isFeatureLayerEnabled(feature, layerName, mapLayers);
      expect(result).to.equal(false);
    });

    it('should return false if the layer is missing', () => {
      const feature = {
        properties: {
          type: 'BUS',
        },
      };
      const layerName = 'foobar';
      const mapLayers = {
        stop: {
          bus: true,
        },
      };

      const result = utils.isFeatureLayerEnabled(feature, layerName, mapLayers);
      expect(result).to.equal(false);
    });

    it('should check feature by type', () => {
      const feature = {
        properties: {
          type: 'BUS',
        },
      };
      const layerName = 'stop';
      const mapLayers = {
        stop: {
          bus: true,
        },
      };

      const result = utils.isFeatureLayerEnabled(feature, layerName, mapLayers);
      expect(result).to.equal(true);
    });

    it('should check terminal instead of stop if feature has stops', () => {
      const feature = {
        properties: {
          stops: 'foobar',
          type: 'BUS',
        },
      };
      const layerName = 'stop';
      const mapLayers = {
        stop: {
          bus: false,
        },
        terminal: {
          bus: true,
        },
      };

      const result = utils.isFeatureLayerEnabled(feature, layerName, mapLayers);
      expect(result).to.equal(true);
    });

    it('should use the config to match ticketSales features', () => {
      const feature = {
        properties: {
          Tyyppi: 'foobar',
        },
      };
      const layerName = 'ticketSales';
      const mapLayers = {
        ticketSales: {
          servicePoint: true,
        },
      };
      const config = {
        mapLayers: {
          featureMapping: {
            ticketSales: {
              foobar: 'servicePoint',
            },
          },
        },
      };

      const result = utils.isFeatureLayerEnabled(
        feature,
        layerName,
        mapLayers,
        config,
      );
      expect(result).to.equal(true);
    });

    it('should fall back to isLayerEnabled if nothing matches', () => {
      const feature = {
        properties: {},
      };
      const layerName = 'parkAndRide';
      const mapLayers = {
        parkAndRide: true,
      };

      const result = utils.isFeatureLayerEnabled(feature, layerName, mapLayers);
      expect(result).to.equal(true);
    });
  });
});
