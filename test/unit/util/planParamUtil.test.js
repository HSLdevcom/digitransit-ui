import { expect } from 'chai';
import { describe, it } from 'mocha';

import defaultConfig from '../../../app/configurations/config.default';
import * as utils from '../../../app/util/planParamUtil';
import { setCustomizedSettings } from '../../../app/store/localStorage';

const from = 'Kera, Espoo::60.217992,24.75494';
const to = 'Leppävaara, Espoo::60.219235,24.81329';
const defaultProps = {
  params: { from, to },
  location: { query: {} },
};

const config = {
  modeToOTP: {
    bus: 'BUS',
    walk: 'WALK',
    citybike: 'BICYCLE_RENT',
  },
  transportModes: {
    bus: {
      availableForSelection: true,
      defaultValue: true,
    },
    citybike: {
      availableForSelection: true,
      defaultValue: false,
    },
  },
  modePolygons: {},
  vehicleRental: {
    networks: {
      smoove: {
        icon: 'citybike',
        name: {
          fi: 'Helsinki ja Espoo',
          sv: 'Helsingfors och Esbo',
          en: 'Helsinki and Espoo',
        },
        type: 'citybike',
      },
    },
  },
  defaultSettings: {
    walkSpeed: 1.2,
    bikeSpeed: 5.55,
  },
  defaultOptions: {
    walkSpeed: [0.69, 0.97, 1.2, 1.67, 2.22],
    bikeSpeed: [2.77, 4.15, 5.55, 6.94, 8.33],
  },
  modesWithNoBike: [],
};

describe('planParamUtil', () => {
  describe('getPlanParams', () => {
    it('should return mode defaults from config if modes are missing from the localStorage', () => {
      const params = utils.getPlanParams(
        config,
        defaultProps,
        utils.PLANTYPE.TRANSIT,
      );
      const modes = params.modes.transit.transit;
      expect(modes).to.deep.equal([{ mode: 'BUS' }]);
    });

    it('should ignore localstorage modes if useDefaultModes is true', () => {
      setCustomizedSettings({ modes: ['BUS', 'SUBWAY'] });
      const params = utils.getPlanParams(
        config,
        defaultProps,
        utils.PLANTYPE.TRANSIT,
        true,
      );
      const modes = params.modes.transit.transit;
      expect(modes).to.deep.equal([{ mode: 'BUS' }]);
    });

    it('should use bikeSpeed from localStorage to find closest possible option in config', () => {
      setCustomizedSettings({ bikeSpeed: 20 });
      const params = utils.getPlanParams(
        defaultConfig,
        defaultProps,
        utils.PLANTYPE.TRANSIT,
      );
      const { bikeSpeed } = params;
      expect(bikeSpeed).to.equal(
        Math.max(...defaultConfig.defaultOptions.bikeSpeed),
      );
    });

    it('should contain all the default settings', () => {
      const defaultKeys = Object.keys(utils.getDefaultSettings(defaultConfig));
      const paramsKeys = Object.keys(
        utils.getPlanParams(
          defaultConfig,
          {
            params: { from, to },
            location: { query: {} },
          },
          utils.PLANTYPE.TRANSIT,
        ),
      );
      const missing = defaultKeys.filter(key => !paramsKeys.includes(key));
      expect(missing).to.deep.equal([]);
    });

    it('should not include CITYBIKE in bikepark modes', () => {
      setCustomizedSettings({
        modes: ['CITYBIKE', 'BUS'],
      });
      const params = utils.getPlanParams(
        defaultConfig,
        {
          params: {
            from,
            to,
          },
          location: {
            query: {},
          },
        },
        utils.PLANTYPE.TRANSIT,
      );
      const modes = params.modes.transit.transit;
      expect(modes).to.deep.equal([{ mode: 'BUS' }]);
    });
  });

  describe('getDefaultSettings', () => {
    it('should include a modes array', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      expect(Array.isArray(defaultSettings.modes)).to.equal(true);
    });
  });

  describe('getSettings', () => {
    it('current settings should equal default settings if no user set settings', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      const currentSettings = utils.getSettings(defaultConfig);
      expect(defaultSettings).to.deep.equal(currentSettings);
    });

    it('setting custom settings should make default settings differ from current settings', () => {
      setCustomizedSettings({
        modes: ['BUS', 'TRAM', 'FERRY', 'SUBWAY', 'RAIL', 'WALK'],
      });

      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      const currentSettings = utils.getSettings(defaultConfig);
      expect(defaultSettings).to.not.deep.equal(currentSettings);
    });

    it('order of set custom settings should not affect default and current settings comparison', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      setCustomizedSettings({
        modes: defaultSettings.modes.slice().reverse(),
      });
      const currentSettings = utils.getSettings(defaultConfig);
      expect(defaultSettings).to.deep.equal(currentSettings);
    });

    it('unavailable modes should not exist in current settings', () => {
      setCustomizedSettings({
        modes: ['BUS', 'WALK', 'FOO'],
      });
      const currentSettings = utils.getSettings(defaultConfig);
      expect(currentSettings.modes.length).to.equal(1);
      expect(currentSettings.modes).to.not.contain('FOO');
    });
  });
});
