/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { StreetMode, TransportMode } from '../../../app/constants';
import * as utils from '../../../app/util/modeUtils';
import { setCustomizedSettings } from '../../../app/store/localStorage';

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

  modePolygons: {},

  modeBoundingBoxes: {},
};

const from = {
  address: 'Mannerheimintie 22-24, Helsinki',
  lat: 60.17063480162678,
  lon: 24.93707656860352,
};

const to = {
  address: 'Tehtaankatu 19, Helsinki',
  lat: 60.15825127085749,
  lon: 24.942741394042972,
};

const intermediatePlaces = [
  {
    address: 'Takaniementie 3A',
    lat: 60.15688,
    lon: 24.86445,
  },
  {
    address: 'Suomenlinna C 53, Helsinki',
    lat: 60.1465466812523,
    lon: 24.988660812377933,
  },
];

describe('modeUtils', () => {
  describe('getAvailableTransportModeConfigs', () => {
    it('should return only available transport modes from config', () => {
      const transportModeConfigs = utils.getAvailableTransportModeConfigs(
        config,
      );
      expect(transportModeConfigs.length).to.equal(3);
      expect(transportModeConfigs[0].name).to.equal(TransportMode.Bus);
      expect(transportModeConfigs[1].name).to.equal(TransportMode.Rail);
      expect(transportModeConfigs[2].name).to.equal(TransportMode.Citybike);
    });
  });

  describe('getModes', () => {
    it('should retrieve modes from localStorage and add WALK mode to them', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, TransportMode.Bus],
      });

      const modes = utils.getModes(config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(TransportMode.Rail);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(StreetMode.Walk);
    });

    it('should retrieve all modes with "defaultValue": true from config if localStorage has an empty modes list', () => {
      setCustomizedSettings({
        modes: [],
      });

      const modes = utils.getModes(config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Rail);
    });

    it('should retrieve all modes with "defaultValue": true from config if localStorage is not available', () => {
      const modes = utils.getModes(config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Rail);
    });

    it('should filter out all modes with "availableForSelection": false from localStorage', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, TransportMode.Airplane, StreetMode.Walk],
      });

      const modes = utils.getModes(config);
      expect(modes.length).to.equal(2);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Rail);
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
      expect(modes.length).to.equal(2);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Rail);
    });

    it('should retrieve all modes with "defaultValue": true from config if has only one available transport mode', () => {
      setCustomizedSettings({
        modes: [
          TransportMode.Rail,
          'FOO',
          StreetMode.Walk,
          StreetMode.ParkAndRide,
        ],
      });

      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          citybike: 'CITYBIKE',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
            defaultValue: true,
          },
          citybike: {
            availableForSelection: false,
            defaultValue: false,
          },
        },
      };

      const modes = utils.getModes(modeConfig);
      expect(modes.length).to.equal(2);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Bus);
    });
  });

  describe('getAvailableTransportModes', () => {
    it('should return all transportModes from config with "availableForSelection": true', () => {
      const modes = utils.getAvailableTransportModes(config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Rail);
      expect(modes).to.contain(TransportMode.Citybike);
    });

    it('should return an empty array if nothing has been configured', () => {
      const modeConfig = {};
      const modes = utils.getAvailableTransportModes(modeConfig);
      expect(modes).to.be.empty;
    });
  });

  describe('getOTPMode', () => {
    it('should return undefined if the given mode is undefined', () => {
      expect(utils.getOTPMode(config, undefined)).to.equal(undefined);
    });

    it('should return undefined if the given mode is not a string', () => {
      expect(utils.getOTPMode(config, {})).to.equal(undefined);
    });

    it('should not matter if the given mode is in UPPERCASE or lowercase', () => {
      const modeConfig = {
        modeToOTP: {
          walk: 'WALK',
        },
      };
      const upperCaseMode = 'WALK';
      const lowerCaseMode = 'walk';

      expect(utils.getOTPMode(modeConfig, upperCaseMode)).to.equal('WALK');
      expect(utils.getOTPMode(modeConfig, lowerCaseMode)).to.equal('WALK');
    });

    it('should return the configured OTP mode in UPPERCASE', () => {
      const modeConfig = {
        modeToOTP: {
          walk: 'walk',
        },
      };

      expect(utils.getOTPMode(modeConfig, StreetMode.Walk)).to.equal('WALK');
    });

    it('should return undefined for a missing mode', () => {
      const modeConfig = {
        modeToOTP: {},
      };

      expect(utils.getOTPMode(modeConfig, StreetMode.Walk)).to.equal(undefined);
    });
  });

  describe('isModeAvailable', () => {
    it('should return true if mode has availableForSelection true', () => {
      expect(utils.isModeAvailable(config, 'BUS')).to.equal(true);
    });

    it('should always return true for WALK mode', () => {
      expect(utils.isModeAvailable(config, 'WALK')).to.equal(true);
    });

    it('should return false if mode has availableForSelection false', () => {
      expect(utils.isModeAvailable(config, 'AIRPLANE')).to.equal(false);
    });

    it('should return false if mode does not exist in config', () => {
      expect(utils.isModeAvailable(config, 'FOO')).to.equal(false);
    });
  });

  describe('isTransportModeAvailable', () => {
    it('should return true if mode has availableForSelection true', () => {
      expect(utils.isTransportModeAvailable(config, 'BUS')).to.equal(true);
    });

    it('should always return false for WALK mode', () => {
      expect(utils.isTransportModeAvailable(config, 'WALK')).to.equal(false);
    });

    it('should return false if mode has availableForSelection false', () => {
      expect(utils.isTransportModeAvailable(config, 'AIRPLANE')).to.equal(
        false,
      );
    });

    it('should return false if mode does not exist in config', () => {
      expect(utils.isTransportModeAvailable(config, 'FOO')).to.equal(false);
    });
  });

  describe('filterModes', () => {
    it('should return an empty array if modes is not available', () => {
      expect(
        utils.filterModes(config, null, from, to, intermediatePlaces).length,
      ).to.equal(0);
    });

    it('should return an empty array if modes is not an array or a string', () => {
      expect(
        utils.filterModes(config, {}, from, to, intermediatePlaces).length,
      ).to.equal(0);
    });

    it('should support a modes array', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = [StreetMode.Walk, TransportMode.Bus];
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
    });

    it('should support a single mode', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = StreetMode.Walk;
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(1);
      expect(result).to.contain('WALK');
    });

    it('should support a comma-separated modes string', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = 'WALK,BUS';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
    });

    it('should omit missing OTP modes', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = 'BUS,CAR_PARK,WALK,UNKNOWN';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
    });

    it('should return only distinct OTP modes', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          public_transport: 'WALK',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = 'PUBLIC_TRANSPORT,BUS,WALK';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
    });

    it('should prevent the use of unavailable street or transport modes', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          car: 'CAR',
          rail: 'RAIL',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
          rail: {
            availableForSelection: false,
          },
        },
        modePolygons: {},
      };
      const modes = 'BUS,CAR,RAIL,WALK';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
    });

    it('should keep FERRY when there is a place inside FERRY modePolygons', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          ferry: 'FERRY',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
          ferry: {
            availableForSelection: true,
          },
        },
        modePolygons: {
          FERRY: [
            // Random polygon that contains no chosen places
            [
              [24.65606689453125, 60.29770119508587],
              [24.620361328125, 60.2786428507011],
              [24.660873413085934, 60.26604463476335],
              [24.684906005859375, 60.27762155444544],
              [24.68353271484375, 60.28783308214864],
              [24.65606689453125, 60.29770119508587],
            ],
            // A rough outline of Suomenlinna
            [
              [24.98737335205078, 60.15936170889179],
              [24.946002960205078, 60.14552126323469],
              [24.97690200805664, 60.1242366231181],
              [25.028228759765625, 60.12740027206243],
              [25.021705627441406, 60.149622743464434],
              [24.98737335205078, 60.15936170889179],
            ],
          ],
        },
      };
      const modes = 'BUS,CAR,RAIL,WALK';
      // last intermediate place should be inside Suomenlinna polygon
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
    });

    it('should filter out FERRY when no places are inside FERRY modePolygons', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          ferry: 'FERRY',
          walk: 'WALK',
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
          ferry: {
            availableForSelection: true,
          },
        },
        modePolygons: {
          FERRY: [
            // A rough outline of Suomenlinna
            [
              [24.98737335205078, 60.15936170889179],
              [24.946002960205078, 60.14552126323469],
              [24.97690200805664, 60.1242366231181],
              [25.028228759765625, 60.12740027206243],
              [25.021705627441406, 60.149622743464434],
              [24.98737335205078, 60.15936170889179],
            ],
          ],
        },
      };
      const modes = 'BUS,CAR,RAIL,WALK';
      // Remove last Suomenlinna location from intermediate places
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces.slice(0, -1),
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
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
      const result = utils.getDefaultTransportModes(modeConfig);

      expect(result.length).to.equal(1);
      expect(result).to.contain('D');
    });
  });

  describe('getDefaultModes', () => {
    it('should include only modes that are both available and default, and WALK', () => {
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
      const result = utils.getDefaultModes(modeConfig);

      expect(result.length).to.equal(2);
      expect(result).to.contain('WALK');
      expect(result).to.contain('D');
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

      expect(utils.showModeSettings(modeConfig)).to.equal(true);
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

      expect(utils.showModeSettings(modeConfig)).to.equal(false);
    });
  });

  describe('getDefaultOTPModes', () => {
    it('should map non-OTP modes to their OTP counterparts', () => {
      const modeConfig = {
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
        },
        modePolygons: {},
      };
      const modes = 'BUS,WALK,UNKNOWN';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result.length).to.equal(2);
      expect(result).to.contain('BUS');
      expect(result).to.contain('WALK');
    });
  });

  describe('userHasChangedModes', () => {
    it('should return true if user has set custom modes', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, TransportMode.Airplane, StreetMode.Walk],
      });

      expect(utils.userHasChangedModes(config)).to.equal(true);
    });

    it('should return false if user has not set custom modes', () => {
      expect(utils.userHasChangedModes(config)).to.equal(false);
    });

    it('should return false if user has set unavailable for selection custom modes in addition to default modes', () => {
      setCustomizedSettings({
        modes: [
          TransportMode.Bus,
          'FOO',
          TransportMode.Rail,
          TransportMode.Airplane,
        ],
      });

      expect(utils.userHasChangedModes(config)).to.equal(false);
    });
  });

  describe('toggleTransportMode', () => {
    it('should return previous modes in addition to new mode', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, StreetMode.Walk],
      });

      const result = utils.toggleTransportMode(TransportMode.Bus, config);

      expect(result.length).to.equal(3);
      expect(result).to.contain(TransportMode.Rail);
      expect(result).to.contain(TransportMode.Bus);
      expect(result).to.contain(StreetMode.Walk);
    });

    it('should return previous modes minus toggled mode if it previously existed', () => {
      setCustomizedSettings({
        modes: [TransportMode.Rail, TransportMode.Bus, StreetMode.Walk],
      });

      const result = utils.toggleTransportMode(TransportMode.Rail, config);

      expect(result.length).to.equal(2);
      expect(result).to.contain(TransportMode.Bus);
      expect(result).to.contain(StreetMode.Walk);
    });
  });

  describe('getBicycleCompatibleModes', () => {
    it('should filter modes that are configured to be uncompatible with bicycle', () => {
      const modeConfig = {
        modesWithNoBike: [
          TransportMode.Airplane,
          TransportMode.Citybike,
          StreetMode.Walk,
        ],
      };
      const modes = [
        TransportMode.Rail,
        TransportMode.Airplane,
        TransportMode.Citybike,
        StreetMode.Walk,
      ];
      const result = utils.getBicycleCompatibleModes(modeConfig, modes);

      expect(result.length).to.equal(1);
      expect(result).to.contain(TransportMode.Rail);
    });
  });

  describe('modesAsOTPModes', () => {
    it('should convert modes into modern OTP format mode objects', () => {
      const modes = ['RAIL', 'BICYCLE_RENT', 'WALK'];
      const result = utils.modesAsOTPModes(modes);

      expect(result.length).to.equal(3);
      expect(result[0]).to.deep.equal({ mode: 'RAIL' });
      expect(result[1]).to.deep.equal({ mode: 'BICYCLE', qualifier: 'RENT' });
      expect(result[2]).to.deep.equal({ mode: 'WALK' });
    });
  });
});
