import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createMemoryHistory } from 'react-router';
import { StreetMode, TransportMode } from '../../app/constants';
import * as utils from '../../app/util/modeUtils';

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
};

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

    it('should retrieve all modes with "defaultValue": true from config if the location query is not available', () => {
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
  });

  describe('getAvailableTransportModes', () => {
    it('should return all transportModes from config with "availableForSelection": true', () => {
      const modes = utils.getAvailableTransportModes(config);
      expect(modes.length).to.equal(3);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Rail);
      expect(modes).to.contain(TransportMode.Citybike);
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
      const allModes = utils.getModes(location, config);
      const availableStreetModes = utils.getAvailableStreetModes(config);
      const streetMode = StreetMode.Walk;

      const query = utils.buildStreetModeQuery(
        allModes,
        availableStreetModes,
        streetMode,
      );

      const modes = query.modes ? query.modes.split(',') : [];
      expect(modes.length).to.equal(4);
      expect(modes).to.contain(StreetMode.Walk);
      expect(modes).to.contain(TransportMode.Rail);
      expect(modes).to.contain(TransportMode.Bus);
      expect(modes).to.contain(TransportMode.Citybike);
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
  });
});
