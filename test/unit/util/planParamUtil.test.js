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
    it('should return mode defaults from config if modes are missing from both the current URI and localStorage', () => {
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

    it('should use the preferred routes from query', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              preferredRoutes: 'HSL__1052',
            },
          },
        },
      );
      const { preferred } = params;
      expect(preferred).to.deep.equal({ routes: 'HSL__1052' });
    });

    it('should use the unpreferred routes from query', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              unpreferredRoutes: 'HSL__7480',
            },
          },
        },
      );
      const { unpreferred } = params;
      expect(unpreferred).to.deep.equal({
        routes: 'HSL__7480',
        useUnpreferredRoutesPenalty: 1200,
      });
    });

    it('should use the preferred routes from localStorage', () => {
      setCustomizedSettings({ preferredRoutes: 'HSL__1052' });
      const params = utils.preparePlanParams(defaultConfig)(...defaultProps);
      const { preferred } = params;
      expect(preferred).to.deep.equal({ routes: 'HSL__1052' });
    });

    it('should use the unpreferred routes from localStorage', () => {
      setCustomizedSettings({ unpreferredRoutes: 'HSL__7480' });
      const params = utils.preparePlanParams(defaultConfig)(...defaultProps);
      const { unpreferred } = params;
      expect(unpreferred).to.deep.equal({
        routes: 'HSL__7480',
        useUnpreferredRoutesPenalty: 1200,
      });
    });

    it('should ignore the preferred routes from localstorage when query contains empty string', () => {
      setCustomizedSettings({ preferredRoutes: 'HSL__1052' });
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              preferredRoutes: '',
            },
          },
        },
      );
      const { preferred } = params;
      expect(preferred).to.deep.equal({});
    });

    it('should ignore the unpreferred routes from localstorage when query contains empty string', () => {
      setCustomizedSettings({ unpreferredRoutes: 'HSL__7480' });
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              unpreferredRoutes: '',
            },
          },
        },
      );
      const { unpreferred } = params;
      expect(unpreferred).to.deep.equal({ useUnpreferredRoutesPenalty: 1200 });
    });

    it('should use bikeSpeed from query', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        { location: { query: { bikeSpeed: 20 } } },
      );
      const { bikeSpeed } = params;
      expect(bikeSpeed).to.equal(20);
    });

    it('should use bikeSpeed from localStorage', () => {
      setCustomizedSettings({ bikeSpeed: 20 });
      const params = utils.preparePlanParams(defaultConfig)(...defaultProps);
      const { bikeSpeed } = params;
      expect(bikeSpeed).to.equal(20);
    });

    it('should replace the old ticketTypes separator "_" with ":" in query', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: { query: { ticketTypes: 'HSL_esp' } },
        },
      );
      const { ticketTypes } = params;
      expect(ticketTypes).to.deep.equal(['HSL:esp']);
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

    it('should use no restrictions if ticketTypes is "none" in query and localStorage has a restriction', () => {
      setCustomizedSettings({ ticketTypes: 'HSL:esp' });
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

    it('should return null if query has no ticketType limits but the default config contains a restriction', () => {
      const limitationSettings = { ...defaultConfig };
      limitationSettings.defaultSettings.ticketTypes = 'HSL:esp';
      const params = utils.preparePlanParams(limitationSettings)(
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

    it('should read OptimizeType TRIANGLE and its fields from the query', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              optimize: 'TRIANGLE',
              safetyFactor: 0.2,
              slopeFactor: 0.3,
              timeFactor: 0.5,
            },
          },
        },
      );
      const { optimize, triangle } = params;
      expect(optimize).to.equal('TRIANGLE');
      expect(triangle).to.deep.equal({
        safetyFactor: 0.2,
        slopeFactor: 0.3,
        timeFactor: 0.5,
      });
    });

    it('should read optimize from the localStorage', () => {
      setCustomizedSettings({ optimize: 'FLAT' });
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
      const { optimize } = params;
      expect(optimize).to.equal('FLAT');
    });

    it('should read OptimizeType TRIANGLE and its fields from the localStorage', () => {
      setCustomizedSettings({
        optimize: 'TRIANGLE',
        safetyFactor: 0.2,
        slopeFactor: 0.3,
        timeFactor: 0.5,
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
      const { optimize, triangle } = params;
      expect(optimize).to.equal('TRIANGLE');
      expect(triangle).to.deep.equal({
        safetyFactor: 0.2,
        slopeFactor: 0.3,
        timeFactor: 0.5,
      });
    });

    it('should have disableRemainingWeightHeuristic as false when CITYBIKE is not selected nor BICYCLE + TRANSIT + viapoints at the same time', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              modes: 'BICYCLE,FERRY,SUBWAY,RAIL',
            },
          },
        },
      );
      const { disableRemainingWeightHeuristic } = params;
      expect(disableRemainingWeightHeuristic).to.equal(false);
    });

    it('should have disableRemainingWeightHeuristic as true when CITYBIKE is selected', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              modes: 'CITYBIKE,BUS,TRAM,FERRY,SUBWAY,RAIL',
            },
          },
        },
      );
      const { disableRemainingWeightHeuristic } = params;
      expect(disableRemainingWeightHeuristic).to.equal(
        defaultConfig.transportModes.citybike.availableForSelection,
      );
    });

    it('should have disableRemainingWeightHeuristic as true when BICYCLE + TRANSIT + viapoints at the same time', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from,
          to,
        },
        {
          location: {
            query: {
              modes: 'BICYCLE,FERRY,SUBWAY,RAIL',
              intermediatePlaces: 'Vantaa,+Vantaa::60.298134,25.006641',
            },
          },
        },
      );
      const { disableRemainingWeightHeuristic } = params;
      expect(disableRemainingWeightHeuristic).to.equal(true);
    });
  });

  describe('getDefaultSettings', () => {
    it('should include a modes array', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      expect(Array.isArray(defaultSettings.modes)).to.equal(true);
    });
  });
});
