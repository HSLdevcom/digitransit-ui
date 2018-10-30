import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  resetCustomizedSettings,
  resetRoutingSettings,
  getRoutingSettings,
  setRoutingSettings,
  getCustomizedSettings,
  setCustomizedSettings,
} from '../../app/store/localStorage';
import defaultConfig from '../../app/configurations/config.default';

const ROUTING_SETTINGS = {
  ignoreRealtimeUpdates: 'false',
  maxPreTransitTime: '1800',
  walkOnStreetReluctance: '1.0',
  waitReluctance: '1.0',
  bikeSpeed: '5.0',
  bikeSwitchTime: '0',
  bikeSwitchCost: '0',
  bikeBoardCost: '600',
  optimize: 'TRIANGLE',
  safetyFactor: '0.334',
  slopeFactor: '0.333',
  timeFactor: '0.333',
  carParkCarLegWeight: '1',
  maxTransfers: '2',
  waitAtBeginningFactor: '0.4',
  heuristicStepsPerMainStep: '8',
  compactLegsByReversedSearch: 'true',
  disableRemainingWeightHeuristic: 'false',
  maxWalkDistance: '2000',
  maxBikingDistance: '100000',
  itineraryFiltering: 'true',
};

describe('localStorage', () => {
  describe('resetCustomizedSettings', () => {
    it('calling this function should not fail', () => {
      resetCustomizedSettings();
    });
  });

  describe('getRoutingSettings', () => {
    it('result should be empty', () => {
      // eslint-disable-next-line
      expect(getRoutingSettings()).to.be.empty;
    });
  });

  describe('setRoutingSettings', () => {
    it('calling this function should not fail', () => {
      setRoutingSettings(ROUTING_SETTINGS);
    });
  });

  describe('Test that routing settings have been changed', () => {
    it('Settings should be equal to what they were set earlier', () => {
      expect(getRoutingSettings()).to.deep.equal(ROUTING_SETTINGS);
    });
  });

  describe('resetRoutingSettings', () => {
    it('reseting routing settings should work', () => {
      resetRoutingSettings();
      // eslint-disable-next-line
      expect(getRoutingSettings()).to.be.empty;
    });
  });

  describe('getCustomizedSettings', () => {
    it('should return an empty object by default', () => {
      expect(getCustomizedSettings()).to.deep.equal({});
    });
  });

  describe('setCustomizedSettings', () => {
    it('should save all default settings', () => {
      const defaultSettings = { ...defaultConfig.defaultSettings };
      setCustomizedSettings(defaultSettings);
      expect(getCustomizedSettings()).to.deep.equal(defaultSettings);
    });

    it('should remove triangle factors if optimize is no longer "TRIANGLE"', () => {
      const initialSettings = {
        optimize: 'TRIANGLE',
        safetyFactor: 0.1,
        slopeFactor: 0.25,
        timeFactor: 0.65,
      };
      setCustomizedSettings(initialSettings);

      let settings = getCustomizedSettings();
      expect(settings.optimize).to.equal(initialSettings.optimize);
      expect(settings.safetyFactor).to.equal(initialSettings.safetyFactor);
      expect(settings.slopeFactor).to.equal(initialSettings.slopeFactor);
      expect(settings.timeFactor).to.equal(initialSettings.timeFactor);

      const updatedSettings = {
        optimize: 'GREENWAYS',
      };
      setCustomizedSettings(updatedSettings);

      settings = getCustomizedSettings();
      expect(settings.optimize).to.equal(updatedSettings.optimize);
      expect(settings.safetyFactor).to.equal(undefined);
      expect(settings.slopeFactor).to.equal(undefined);
      expect(settings.timeFactor).to.equal(undefined);

      setCustomizedSettings({ optimize: 'TRIANGLE' });

      settings = getCustomizedSettings();
      expect(settings.optimize).to.equal('TRIANGLE');
      expect(settings.safetyFactor).to.equal(undefined);
      expect(settings.slopeFactor).to.equal(undefined);
      expect(settings.timeFactor).to.equal(undefined);
    });
  });
});
