/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createMemoryHistory } from 'react-router';
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
  },

  streetModes: {
    walk: {
      availableForSelection: true,
      defaultValue: true,
      icon: 'walk',
    },

    bicycle: {
      availableForSelection: true,
      defaultValue: false,
      icon: 'bicycle-withoutBox',
    },

    car: {
      availableForSelection: true,
      defaultValue: false,
      icon: 'car-withoutBox',
    },

    car_park: {
      availableForSelection: false,
      defaultValue: false,
      icon: 'car_park-withoutBox',
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
  describe('getModes', () => {
    it('should decode modes from the location query', () => {
      const location = {
        query: {
          modes: 'WALK,BICYCLE,BUS',
        },
      };

      const modes = utils.getModes(location, config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(StreetMode.Bicycle);
      expect(modes).to.contain(TransportMode.Bus);
    });

    it('should return all modes in UPPERCASE', () => {
      const location = {
        query: {
          modes: 'walk,BUS',
        },
      };

      const modes = utils.getModes(location, config);
      expect(modes.length).to.equal(2);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Bus);
    });

    it('should retrieve modes from localStorage if the location query is not available', () => {
      setCustomizedSettings({
        modes: [StreetMode.ParkAndRide, TransportMode.Bus],
      });
      const location = {
        query: {
          modes: undefined,
        },
      };

      const modes = utils.getModes(location, config);
      expect(modes.length).to.equal(2);
      expect(modes).to.contain(StreetMode.ParkAndRide);
      expect(modes).to.contain(TransportMode.Bus);
    });

    it('should retrieve all modes with "defaultValue": true from config if the location query is not available and localStorage has an empty modes list', () => {
      setCustomizedSettings({
        modes: [],
      });
      const location = {
        query: {
          modes: undefined,
        },
      };

      const modes = utils.getModes(location, config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Rail);
    });

    it('should retrieve all modes with "defaultValue": true from config if the location query and localStorage are not available', () => {
      const location = {
        query: {
          modes: undefined,
        },
      };

      const modes = utils.getModes(location, config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Rail);
    });
  });

  describe('getAvailableStreetModes', () => {
    it('should return all streetModes from config with "availableForSelection": true', () => {
      const modes = utils.getAvailableStreetModes(config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(StreetMode.Bicycle);
      expect(modes).to.contain(StreetMode.Car);
    });

    it('should return an empty array if nothing has been configured', () => {
      const modeConfig = {};
      const modes = utils.getAvailableStreetModes(modeConfig);
      expect(modes).to.be.empty;
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

  describe('getStreetMode', () => {
    it('for an empty location it should return the street mode that has "defaultValue": true', () => {
      const location = {};
      const configWithSingleDefault = {
        streetModes: {
          car: {
            availableForSelection: true,
            defaultValue: true,
          },
          walk: {
            availableForSelection: true,
            defaultValue: false,
          },
        },
        transportModes: {
          ...config.transportModes,
        },
      };

      const mode = utils.getStreetMode(location, configWithSingleDefault);
      expect(mode).to.equal(StreetMode.Car);
    });

    it('for an empty location it should return the first street mode that has "defaultValue": true', () => {
      const location = {};
      const configWithMultipleDefaults = {
        streetModes: {
          car: {
            availableForSelection: true,
            defaultValue: true,
          },
          walk: {
            availableForSelection: true,
            defaultValue: true,
          },
        },
        transportModes: {
          ...config.transportModes,
        },
      };

      const mode = utils.getStreetMode(location, configWithMultipleDefaults);
      expect(mode).to.equal(StreetMode.Car);
    });

    it('for an empty location it should return undefined if no street mode has been set as default', () => {
      const location = {};
      const brokenConfig = {
        streetModes: {
          car: {
            availableForSelection: true,
            defaultValue: false,
          },
          walk: {
            availableForSelection: true,
            defaultValue: false,
          },
        },
        transportModes: {
          ...config.transportModes,
        },
      };

      const mode = utils.getStreetMode(location, brokenConfig);
      expect(mode).to.equal(undefined);
    });

    it('for a non-empty location it should return the specified street mode from the location', () => {
      const location = {
        query: {
          modes: 'BICYCLE,RAIL,TRAM',
        },
      };

      const mode = utils.getStreetMode(location, config);
      expect(mode).to.equal(StreetMode.Bicycle);
    });

    it('for a non-empty location missing street modes it should return the default street mode from config', () => {
      const location = {
        query: {
          modes: 'BUS,RAIL,TRAM',
        },
      };

      const mode = utils.getStreetMode(location, config);
      expect(mode).to.equal(StreetMode.Walk);
    });
  });

  describe('buildStreetModeQuery', () => {
    it('should remove all other streetModes from the query but leave the transportModes', () => {
      const location = {
        query: {
          modes: 'CAR,WALK,RAIL,BUS,CITYBIKE',
        },
      };
      const currentModes = utils.getModes(location, config);
      const streetMode = StreetMode.Walk;

      const query = utils.buildStreetModeQuery(
        config,
        currentModes,
        streetMode,
      );

      const modes = query.modes ? query.modes.split(',') : [];
      expect(modes.length).to.equal(4);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Rail);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Citybike);
    });

    it('should always include default transportModes in the query when isExclusive=false and no transportModes are selected', () => {
      const location = {
        query: {
          modes: 'CAR',
        },
      };
      const currentModes = utils.getModes(location, config);
      const streetMode = StreetMode.Walk;

      const query = utils.buildStreetModeQuery(
        config,
        currentModes,
        streetMode,
      );

      const modes = query.modes ? query.modes.split(',') : [];
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Rail);
      expect(modes).to.contain(TransportMode.Bus);
    });

    it('should remove every other mode from the query when isExclusive=true', () => {
      const location = {
        query: {
          modes: 'CAR,WALK,RAIL,BUS,CITYBIKE',
        },
      };
      const currentModes = utils.getModes(location, config);
      const streetMode = StreetMode.Walk;

      const query = utils.buildStreetModeQuery(
        config,
        currentModes,
        streetMode,
        true,
      );

      const modes = query.modes ? query.modes.split(',') : [];
      expect(modes.length).to.equal(1);
      expect(modes).to.contain(StreetMode.Walk);
    });
  });

  describe('setStreetMode', () => {
    it('should apply the selected streetMode to the current url', () => {
      const streetMode = StreetMode.ParkAndRide;
      const router = createMemoryHistory();
      router.location = {
        query: {
          modes: 'CAR,WALK,RAIL,BUS,CITYBIKE',
        },
      };

      utils.setStreetMode(streetMode, config, router);

      const { query } = router.getCurrentLocation();
      const modes = query.modes ? query.modes.split(',') : [];
      expect(modes.length).to.equal(4);
      expect(modes).to.contain(StreetMode.ParkAndRide);
      expect(modes).to.contain(TransportMode.Rail);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Citybike);
    });

    it('should remove every other mode from the current url when isExclusive=true', () => {
      const streetMode = StreetMode.ParkAndRide;
      const router = createMemoryHistory();
      router.location = {
        query: {
          modes: 'CAR,WALK,RAIL,BUS,CITYBIKE',
        },
      };

      utils.setStreetMode(streetMode, config, router, true);

      const { query } = router.getCurrentLocation();
      const modes = query.modes ? query.modes.split(',') : [];
      expect(modes.length).to.equal(1);
      expect(modes).to.contain(StreetMode.ParkAndRide);
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

  describe('filterModes', () => {
    it('should return an empty string if modes is not available', () => {
      expect(
        utils.filterModes(config, null, from, to, intermediatePlaces),
      ).to.equal('');
    });

    it('should return an empty string if modes is not an array or a string', () => {
      expect(
        utils.filterModes(config, {}, from, to, intermediatePlaces),
      ).to.equal('');
    });

    it('should support a modes array', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          car_park: 'CAR_PARK',
          walk: 'WALK',
        },
        streetModes: {
          car_park: {
            availableForSelection: true,
          },
          walk: {
            availableForSelection: true,
          },
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = [
        StreetMode.ParkAndRide,
        StreetMode.Walk,
        TransportMode.Bus,
      ];
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result).to.equal('BUS,CAR_PARK,WALK');
    });

    it('should support a single mode', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          car_park: 'CAR_PARK',
          walk: 'WALK',
        },
        streetModes: {
          car_park: {
            availableForSelection: true,
          },
          walk: {
            availableForSelection: true,
          },
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = 'CAR_PARK';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result).to.equal('CAR_PARK');
    });

    it('should support a comma-separated modes string', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          car_park: 'CAR_PARK',
          walk: 'WALK',
        },
        streetModes: {
          car_park: {
            availableForSelection: true,
          },
          walk: {
            availableForSelection: true,
          },
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modePolygons: {},
      };
      const modes = 'WALK,BUS,CAR_PARK';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result).to.equal('BUS,CAR_PARK,WALK');
    });

    it('should omit missing OTP modes', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
        },
        streetModes: {
          car_park: {
            availableForSelection: true,
          },
          walk: {
            availableForSelection: true,
          },
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

      expect(result).to.equal('BUS,WALK');
    });

    it('should return only distinct OTP modes', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          public_transport: 'WALK',
          walk: 'WALK',
        },
        streetModes: {
          public_transport: {
            availableForSelection: true,
          },
          walk: {
            availableForSelection: true,
          },
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

      expect(result).to.equal('BUS,WALK');
    });

    it('should prevent the use of unavailable street or transport modes', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          car: 'CAR',
          rail: 'RAIL',
          walk: 'WALK',
        },
        streetModes: {
          walk: {
            availableForSelection: true,
          },
          car: {
            availableForSelection: false,
          },
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

      expect(result).to.equal('BUS,WALK');
    });

    it('should keep FERRY when there is a place inside FERRY modePolygons', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          ferry: 'FERRY',
          walk: 'WALK',
        },
        streetModes: {
          walk: {
            availableForSelection: true,
          },
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

      expect(result).to.equal('BUS,WALK');
    });

    it('should filter out FERRY when no places are inside FERRY modePolygons', () => {
      const modeConfig = {
        modeToOTP: {
          bus: 'BUS',
          ferry: 'FERRY',
          walk: 'WALK',
        },
        streetModes: {
          walk: {
            availableForSelection: true,
          },
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

      expect(result).to.equal('BUS,WALK');
    });
  });

  describe('getDefaultStreetModes', () => {
    it('should include only modes that are both available and default', () => {
      const modeConfig = {
        streetModes: {
          a: {
            availableForSelection: true,
            defaultValue: true,
          },
          b: {
            availableForSelection: false,
            defaultValue: true,
          },
          c: {
            availableForSelection: true,
            defaultValue: false,
          },
        },
      };
      const result = utils.getDefaultStreetModes(modeConfig);

      expect(result.length).to.equal(1);
      expect(result).to.contain('A');
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
    it('should include only modes that are both available and default', () => {
      const modeConfig = {
        streetModes: {
          a: {
            availableForSelection: true,
            defaultValue: true,
          },
          b: {
            availableForSelection: false,
            defaultValue: true,
          },
          c: {
            availableForSelection: true,
            defaultValue: false,
          },
        },
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
      expect(result).to.contain('A');
      expect(result).to.contain('D');
    });
  });

  describe('getDefaultOTPModes', () => {
    it('should map non-OTP modes to their OTP counterparts', () => {
      const modeConfig = {
        streetModes: {
          public_transport: {
            availableForSelection: true,
          },
          walk: {
            availableForSelection: true,
          },
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
          public_transport: 'WALK',
        },
        modePolygons: {},
      };
      const modes = 'BUS,CAR_PARK,WALK,UNKNOWN,PUBLIC_TRANSPORT';
      const result = utils.filterModes(
        modeConfig,
        modes,
        from,
        to,
        intermediatePlaces,
      );

      expect(result).to.equal('BUS,WALK');
    });
  });

  describe('isBikeRestricted', () => {
    it('should return true if using a bike and attempting to choose a mode and config with restricted bike usage', () => {
      const location = {
        query: {
          modes: 'BICYCLE,SUBWAY,RAIL',
        },
      };
      const modeConfig = {
        modesWithNoBike: ['BUS', 'TRAM'],
        streetModes: {
          bicycle: {
            availableForSelection: true,
          },
        },
        transportModes: {
          bus: {
            availableForSelection: true,
          },
        },
      };
      const mode = 'BUS';
      const result = utils.isBikeRestricted(location, modeConfig, mode);
      expect(result).to.equal(true);
    });
  });
  describe('isBikeRestricted', () => {
    it('should return true if an array of transport modes causes restrictions to bicycling', () => {
      const location = {
        query: {
          modes: 'BICYCLE',
        },
      };
      const modeConfig = {
        ...config,
        modesWithNoBike: ['BUS', 'TRAM'],
        transportModes: {
          subway: {
            availableForSelection: true,
            defaultValue: true,
          },
        },
      };
      const modes = ['BUS', 'SUBWAY', 'RAIL'];
      const result = utils.isBikeRestricted(location, modeConfig, modes);
      expect(result).to.equal(true);
    });
  });
});
