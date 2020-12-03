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

describe('planParamUtil', () => {
  describe('preparePlanParams', () => {
    it('should return mode defaults from config if modes are missing from the localStorage', () => {
      const config = {
        modeToOTP: {
          bus: 'BUS',
          walk: 'WALK',
          citybike: 'BICYCLE_RENT',
        },
        streetModes: {
          walk: {
            availableForSelection: true,
            defaultValue: true,
            icon: 'walk',
          },
        },
        transportModes: {
          bus: {
            availableForSelection: true,
            defaultValue: true,
          },
          citybike: {
            availableForSelection: true,
            defaultValue: true,
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
      };
      const params = utils.preparePlanParams(config)(...defaultProps);
      const { modes } = params;
      expect(modes).to.deep.equal([
        { mode: 'BICYCLE', qualifier: 'RENT' },
        { mode: 'BUS' },
        { mode: 'WALK' },
      ]);
    });

    it('should use the optimize mode from query', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              optimize: 'GREENWAYS',
            },
          },
        },
      );
      const { optimize } = params;

      expect(optimize).to.equal('GREENWAYS');
    });

    it('should use bikeSpeed from localStorage to find closest possible option in config', () => {
      setCustomizedSettings({ bikeSpeed: 20 });
      const params = utils.preparePlanParams(defaultConfig)(...defaultProps);
      const { bikeSpeed } = params;
      expect(bikeSpeed).to.equal(
        Math.max(...defaultConfig.defaultOptions.bikeSpeed),
      );
    });

    it('should replace the old ticketTypes separator "_" with ":" in localStorage', () => {
      setCustomizedSettings({ ticketTypes: 'HSL_esp' });
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(limitationSettings)(
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
      const params = utils.preparePlanParams(limitationSettings)(
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
      const params = utils.preparePlanParams(limitationSettings)(
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
        utils.preparePlanParams(defaultConfig)(
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
      const params = utils.preparePlanParams(defaultConfig)(
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

    it('should have disableRemainingWeightHeuristic as true when CITYBIKE is selected', () => {
      setCustomizedSettings({
        modes: ['CITYBIKE', 'BUS', 'TRAM', 'FERRY', 'SUBWAY', 'RAIL'],
      });
      const params = utils.preparePlanParams(defaultConfig)(
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
  });

  describe('getDefaultSettings', () => {
    it('should include a modes array', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      expect(Array.isArray(defaultSettings.modes)).to.equal(true);
    });
  });
});
