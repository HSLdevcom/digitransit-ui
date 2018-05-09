import { expect } from 'chai';
import { describe, it } from 'mocha';
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

  describe('toggleStreetMode', () => {
    it('should remove all other streetModes from the query', () => {
      const location = {
        query: {
          modes: 'CAR,WALK,RAIL,BUS,CITYBIKE',
        },
      };
      const allModes = utils.getModes(location, config);
      const availableStreetModes = utils.getAvailableStreetModes(config);
      const streetMode = StreetMode.Walk;

      const query = utils.toggleStreetMode(
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
});
