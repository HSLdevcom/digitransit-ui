/* eslint-disable no-unused-expressions */
import { StreetMode, TransportMode } from '../../../../utils/shared/constants';
import * as utils from '../../../../utils/client/modeUtils';
import { setCustomizedSettings } from '../../../../utils/client/localStorage';

const config = {
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },

    rail: {
      availableForSelection: true,
      defaultValue: true,
    },

    citybike: {
      availableForSelection: true,
      defaultValue: false,
    },

    airplane: {
      availableForSelection: false,
      defaultValue: false,
    },
  },
};

describe('modeUtils', () => {
  describe('getAvailableTransportModeConfigs', () => {
    it('should return only available transport modes from config', () => {
      const transportModeConfigs =
        utils.getAvailableTransportModeConfigs(config);
      expect(transportModeConfigs.length).toBe(3);
      expect(transportModeConfigs[0].name).toBe(TransportMode.Bus);
      expect(transportModeConfigs[1].name).toBe(TransportMode.Rail);
      expect(transportModeConfigs[2].name).toBe(TransportMode.Citybike);
    });
  });

  describe('getModes', () => {
    it('should retrieve modes from localStorage', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, TransportMode.Bus],
      });

      const modes = utils.getModes(config);
      expect(modes.length).toBe(2);
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Rail]));
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Bus]));
    });

    it('should retrieve all modes with "defaultValue": true from config if localStorage is not available', () => {
      const modes = utils.getModes(config);
      expect(modes.length).toBe(2);
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Bus]));
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Rail]));
    });

    it('should filter out all modes with "availableForSelection": false from localStorage', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, TransportMode.Airplane, StreetMode.Walk],
      });

      const modes = utils.getModes(config);
      expect(modes.length).toBe(1);
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Rail]));
    });

    it('should filter out all unconfigured modes from localStorage', () => {
      setCustomizedSettings({
        modes: [
          TransportMode.Rail,
          'FOO',
          StreetMode.Walk,
          StreetMode.ParkAndRide,
        ],
      });

      const modes = utils.getModes(config);
      expect(modes.length).toBe(1);
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Rail]));
    });
  });

  describe('getAvailableTransportModes', () => {
    it('should return all transportModes from config with "availableForSelection": true', () => {
      const modes = utils.getAvailableTransportModes(config);
      expect(modes.length).toBe(3);
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Bus]));
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Rail]));
      expect(modes).toEqual(expect.arrayContaining([TransportMode.Citybike]));
    });

    it('should return an empty array if nothing has been configured', () => {
      const modeConfig = {};
      const modes = utils.getAvailableTransportModes(modeConfig);
      expect(Object.keys(modes)).toHaveLength(0);
    });
  });

  describe('isTransportModeAvailable', () => {
    it('should return true if mode has availableForSelection true', () => {
      expect(utils.isTransportModeAvailable(config, 'BUS')).toBe(true);
    });

    it('should always return false for WALK mode', () => {
      expect(utils.isTransportModeAvailable(config, 'WALK')).toBe(false);
    });

    it('should return false if mode has availableForSelection false', () => {
      expect(utils.isTransportModeAvailable(config, 'AIRPLANE')).toBe(false);
    });

    it('should return false if mode does not exist in config', () => {
      expect(utils.isTransportModeAvailable(config, 'FOO')).toBe(false);
    });
  });

  describe('getNearYouModes', () => {
    const nearYouConfig = {
      nearYouModes: ['favorite', 'citybike'],
      vehicleRental: {
        networks: {
          foo: {
            enabled: true,
            type: 'citybike',
            season: { alwaysOn: true },
          },
        },
      },
    };
    it('keeps favorite and citybike modes when both are available', () => {
      const modes = utils.getNearYouModes(nearYouConfig, true);
      expect(modes).toContain('favorite');
      expect(modes).toContain('citybike');
    });

    it('drops favorite when no available OTP location favourites remain', () => {
      const modes = utils.getNearYouModes(nearYouConfig, false);
      expect(modes).not.toContain('favorite');
      expect(modes).toContain('citybike');
    });

    it('keeps favorite independently of whether citybike mode is configured', () => {
      const modes = utils.getNearYouModes(
        { ...nearYouConfig, nearYouModes: ['favorite', 'bus'] },
        true,
      );
      expect(modes).toEqual(['favorite', 'bus']);
    });

    it('drops citybike outside the season without hiding valid stop favourites', () => {
      const modes = utils.getNearYouModes(
        { ...nearYouConfig, vehicleRental: { networks: {} } },
        true,
      );
      expect(modes).toEqual(['favorite']);
    });
  });

  describe('getDefaultTransportModes', () => {
    it('should include only modes that are both available and default', () => {
      const modeConfig = {
        transportModes: {
          d: {
            availableForSelection: true,
            defaultValue: true,
          },
          e: {
            availableForSelection: false,
            defaultValue: true,
          },
          f: {
            availableForSelection: true,
            defaultValue: false,
          },
        },
      };
      const result = utils.getTransitModes(modeConfig);

      expect(result.length).toBe(1);
      expect(result).toContain('D');
    });
  });

  describe('getTransitModes', () => {
    it('should include only modes that are both available and default', () => {
      const modeConfig = {
        transportModes: {
          d: {
            availableForSelection: true,
            defaultValue: true,
          },
          e: {
            availableForSelection: false,
            defaultValue: true,
          },
          f: {
            availableForSelection: true,
            defaultValue: false,
          },
        },
      };
      const result = utils.getTransitModes(modeConfig);

      expect(result.length).toBe(1);
      expect(result).toContain('D');
    });
  });

  describe('showModeSettings', () => {
    it('should return true when there are multiple available transport modes', () => {
      const modeConfig = {
        transportModes: {
          d: {
            availableForSelection: true,
            defaultValue: true,
          },
          e: {
            availableForSelection: true,
            defaultValue: false,
          },
        },
      };

      expect(utils.showModeSettings(modeConfig)).toBe(true);
    });

    it('should return false when there is only one available transport mode', () => {
      const modeConfig = {
        transportModes: {
          d: {
            availableForSelection: true,
            defaultValue: true,
          },
          e: {
            availableForSelection: false,
            defaultValue: false,
          },
        },
      };

      expect(utils.showModeSettings(modeConfig)).toBe(false);
    });
  });

  describe('toggleTransportMode', () => {
    it('should return previous modes in addition to new mode', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, StreetMode.Walk],
      });

      const result = utils.toggleTransportMode(TransportMode.Bus, config);

      expect(result.length).toBe(2);
      expect(result).toEqual(expect.arrayContaining([TransportMode.Rail]));
      expect(result).toEqual(expect.arrayContaining([TransportMode.Bus]));
    });

    it('should return previous modes minus toggled mode if it previously existed', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, TransportMode.Bus, StreetMode.Walk],
      });

      const result = utils.toggleTransportMode(TransportMode.Rail, config);

      expect(result.length).toBe(1);
      expect(result).toEqual(expect.arrayContaining([TransportMode.Bus]));
    });
  });
});
