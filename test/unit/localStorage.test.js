import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  getLocalStorage,
  resetCustomizedSettings,
  resetRoutingSettings,
  getRoutingSettings,
  setRoutingSettings,
  getCustomizedSettings,
  setCustomizedSettings,
  getReadMessageIds,
  setReadMessageIds,
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
      setRoutingSettings(ROUTING_SETTINGS);
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
      // empty unpreferredRoutes and preferredRoutes should not be stored
      const {
        unpreferredRoutes,
        preferredRoutes,
        ...resultSettings
      } = defaultSettings;
      expect(getCustomizedSettings()).to.deep.equal(resultSettings);
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

    it('should remove unpreferredRoutes and preferredRoutes if there are none', () => {
      const initialSettings = {
        preferredRoutes: ['HSL__1050'],
        unpreferredRoutes: ['HSL__4555'],
      };
      setCustomizedSettings(initialSettings);

      let settings = getCustomizedSettings();
      expect(settings.preferredRoutes).to.deep.equal(
        initialSettings.preferredRoutes,
      );
      expect(settings.unpreferredRoutes).to.deep.equal(
        initialSettings.unpreferredRoutes,
      );

      const updatedSettings = {
        preferredRoutes: [],
        unpreferredRoutes: [],
      };
      setCustomizedSettings(updatedSettings);

      settings = getCustomizedSettings();
      // eslint-disable-next-line no-unused-expressions
      expect(settings.preferredRoutes).to.be.undefined;
      // eslint-disable-next-line no-unused-expressions
      expect(settings.unpreferredRoutes).to.be.undefined;
    });
  });

  describe('getLocalStorage', () => {
    it('should invoke the given errorHandler if in browser and localStorage throws', () => {
      const handler = sinon.stub();
      const stub = sinon.stub(window, 'localStorage').get(() => {
        throw new DOMException();
      });
      getLocalStorage(true, handler);
      expect(handler.called).to.equal(true);
      stub.restore();
    });

    it('should return null if thrown exception was a SecurityError and it was handled by default', () => {
      const stub = sinon.stub(window, 'localStorage').get(() => {
        throw new DOMException('Foo', 'SecurityError');
      });
      const result = getLocalStorage(true);
      expect(result).to.equal(null);
      stub.restore();
    });

    it('should return window.localStorage if in browser', () => {
      const result = getLocalStorage(true);
      expect(result).to.equal(window.localStorage);
    });

    it('should return global.localStorage if not in browser', () => {
      const result = getLocalStorage(false);
      expect(result).to.equal(global.localStorage);
    });
  });
  describe('getReadMessageIds', () => {
    it('result should be empty array', () => {
      const result = getReadMessageIds();
      // eslint-disable-next-line no-unused-expressions
      expect(result).to.be.empty;
    });
    it('result should be "1"', () => {
      window.localStorage.setItem('readMessages', JSON.stringify(1));
      const result = getReadMessageIds();
      expect(result).to.equal(JSON.parse('1'));
    });
  });

  describe('setReadMessageIds', () => {
    it('result should be ["1"]', () => {
      setReadMessageIds(['1']);
      const result = window.localStorage.getItem('readMessages');
      expect(result).to.equal('["1"]');
    });
  });
});
