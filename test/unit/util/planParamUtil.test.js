import { expect } from 'chai';
import { describe, it } from 'mocha';

import defaultConfig from '../../../app/configurations/config.default';
import * as utils from '../../../app/util/planParamUtil';
import { setCustomizedSettings } from '../../../app/store/localStorage';

const from = 'Kera, Espoo::60.217992,24.75494';
const to = 'Leppävaara, Espoo::60.219235,24.81329';
const defaultProps = [
  {
    from,
    to,
  },
  { location: { query: {} } },
];

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
  cityBike: {
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
  modesWithNoBike: ['BICYCLE_RENT', 'WALK'],
};

describe('planParamUtil', () => {
  describe('preparePlanParams', () => {
    it('should return mode defaults from config if modes are missing from the localStorage', () => {
      const params = utils.preparePlanParams(config, false)(...defaultProps);
      const { modes } = params;
      expect(modes).to.deep.equal([{ mode: 'BUS' }, { mode: 'WALK' }]);
    });

    it('should ignore localstorage modes if useDefaultModes is true', () => {
      setCustomizedSettings({ modes: ['BUS', 'SUBWAY'] });
      const params = utils.preparePlanParams(config, true)(...defaultProps);
      const { modes } = params;
      expect(modes).to.deep.equal([{ mode: 'BUS' }, { mode: 'WALK' }]);
    });

    it('should use bikeSpeed from localStorage to find closest possible option in config', () => {
      setCustomizedSettings({ bikeSpeed: 20 });
      const params = utils.preparePlanParams(
        defaultConfig,
        false,
      )(...defaultProps);
      const { bikeSpeed } = params;
      expect(bikeSpeed).to.equal(
        Math.max(...defaultConfig.defaultOptions.bikeSpeed),
      );
    });

    it('should replace the old ticketTypes separator "_" with ":" in localStorage', () => {
      setCustomizedSettings({ ticketTypes: 'HSL_esp' });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.deep.equal(['HSL:esp']);
    });

    it('should return null if no ticketTypes are found from query or localStorage', () => {
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should use ticketTypes from localStorage if no ticketTypes are found from query', () => {
      setCustomizedSettings({ ticketTypes: 'HSL:esp' });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.deep.equal(['HSL:esp']);
    });

    it('should return null if ticketTypes is "none" in query', () => {
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: { ticketTypes: 'none' } },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should return null if ticketTypes is missing from query and "none" in localStorage', () => {
      setCustomizedSettings({ ticketTypes: 'none' });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should return null if ticketTypes is "none" in both query and localStorage', () => {
      setCustomizedSettings({ ticketTypes: 'none' });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: { ticketTypes: 'none' } },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should return null if ticketTypes is undefined in query', () => {
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: { ticketTypes: undefined } },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should return null if ticketTypes is missing from query and undefined in localStorage', () => {
      setCustomizedSettings({ ticketTypes: undefined });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should return null if ticketTypes is undefined in both query and localStorage', () => {
      setCustomizedSettings({ ticketTypes: undefined });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: { query: { ticketTypes: undefined } },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should return null if localStorage has no ticketType limits but the default config contains a restriction', () => {
      setCustomizedSettings({ ticketTypes: 'none' });
      const limitationSettings = { ...defaultConfig };
      limitationSettings.defaultSettings.ticketTypes = 'HSL:esp';
      const params = utils.preparePlanParams(limitationSettings, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.equal(null);
    });

    it('should use the configured default restriction if the user has given no ticketTypes', () => {
      const limitationSettings = { ...defaultConfig };
      limitationSettings.defaultSettings.ticketTypes = 'HSL:esp';
      const params = utils.preparePlanParams(limitationSettings, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.deep.equal(['HSL:esp']);
    });

    it('should remap the configured default restriction if the user has given no ticketTypes', () => {
      const limitationSettings = { ...defaultConfig };
      limitationSettings.defaultSettings.ticketTypes = 'HSL_esp';
      const params = utils.preparePlanParams(limitationSettings, false)(
        {
          from,
          to,
        },
        {
          location: { query: {} },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.deep.equal(['HSL:esp']);
    });

    it('should contain all the default settings', () => {
      const defaultKeys = Object.keys(utils.getDefaultSettings(defaultConfig));
      const paramsKeys = Object.keys(
        utils.preparePlanParams(defaultConfig, false)(
          { from, to },
          { location: { query: {} } },
        ),
      );
      const missing = defaultKeys.filter(key => !paramsKeys.includes(key));
      expect(missing).to.deep.equal([]);
    });

    it('should have disableRemainingWeightHeuristic as false when CITYBIKE is not selected nor BICYCLE + TRANSIT + viapoints at the same time', () => {
      setCustomizedSettings({
        modes: ['BICYCLE', 'FERRY', 'SUBWAY', 'RAIL'],
      });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: {
            query: {},
          },
        },
      );
      const { disableRemainingWeightHeuristic } = params;
      expect(disableRemainingWeightHeuristic).to.equal(false);
    });

    it('should not include CITYBIKE in bikepark modes', () => {
      setCustomizedSettings({
        modes: ['CITYBIKE', 'BUS'],
      });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: {
            query: {},
          },
        },
      );
      const { bikeParkModes } = params;
      expect(bikeParkModes).to.deep.equal([
        { mode: 'BICYCLE', qualifier: 'PARK' },
        { mode: 'BUS' },
        { mode: 'WALK' },
      ]);
    });

    it('should have disableRemainingWeightHeuristic as true when CITYBIKE is selected', () => {
      setCustomizedSettings({
        modes: ['CITYBIKE', 'BUS', 'TRAM', 'FERRY', 'SUBWAY', 'RAIL'],
      });
      const params = utils.preparePlanParams(defaultConfig, false)(
        {
          from,
          to,
        },
        {
          location: {
            query: {},
          },
        },
      );
      const { disableRemainingWeightHeuristic } = params;
      expect(disableRemainingWeightHeuristic).to.equal(
        defaultConfig.transportModes.citybike.availableForSelection,
      );
    });

    it('should use same letter case for citybike networks from custom settings as in default settings', () => {
      setCustomizedSettings({
        allowedBikeRentalNetworks: ['FOO'],
      });
      const configWithCitybikes = {
        ...defaultConfig,
        cityBike: {
          capacity: 'Bikes on station',
          networks: {
            foo: {
              enabled: true,
              icon: 'citybike',
              name: {
                en: 'Foo bikes',
              },
              type: 'citybike',
            },
            bar: {
              enabled: true,
              icon: 'citybike',
              name: {
                en: 'Bar bikes',
              },
              type: 'citybike',
            },
          },
        },
      };
      const params = utils.preparePlanParams(configWithCitybikes, false)(
        {
          from,
          to,
        },
        {
          location: {
            query: {},
          },
        },
      );
      const { allowedBikeRentalNetworks } = params;
      expect(allowedBikeRentalNetworks).to.deep.equal(['foo']);
    });
  });

  describe('getDefaultSettings', () => {
    it('should include a modes array', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      expect(Array.isArray(defaultSettings.modes)).to.equal(true);
    });
  });

  describe('getCurrentSettings', () => {
    it('current settings should equal default settings if no user set settings', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      const currentSettings = utils.getCurrentSettings(defaultConfig);
      expect(defaultSettings).to.deep.equal(currentSettings);
    });

    it('setting custom settings should make default settings differ from current settings', () => {
      setCustomizedSettings({
        modes: ['BUS', 'TRAM', 'FERRY', 'SUBWAY', 'RAIL', 'WALK'],
      });

      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      const currentSettings = utils.getCurrentSettings(defaultConfig);
      expect(defaultSettings).to.not.deep.equal(currentSettings);
    });

    it('order of set custom settings should not affect default and current settings comparison', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      setCustomizedSettings({
        modes: defaultSettings.modes.slice().reverse(),
      });
      const currentSettings = utils.getCurrentSettings(defaultConfig);
      expect(defaultSettings).to.deep.equal(currentSettings);
    });

    it('unavailable modes should not exist in current settings', () => {
      setCustomizedSettings({
        modes: ['BUS', 'WALK', 'FOO'],
      });
      const currentSettings = utils.getCurrentSettings(defaultConfig);
      expect(currentSettings.modes.length).to.equal(2);
      expect(currentSettings.modes).to.not.contain('FOO');
    });
  });
});
