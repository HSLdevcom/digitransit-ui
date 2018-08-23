import { expect } from 'chai';
import { describe, it } from 'mocha';

import defaultConfig from '../../app/configurations/config.default';
import * as utils from '../../app/util/planParamUtil';

describe('planParamUtil', () => {
  describe('preparePlanParams', () => {
    it('should return mode defaults from config if modes are missing from both the current URI and localStorage', () => {
      const config = {
        modeToOTP: {
          bus: 'bus',
          walk: 'walk',
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
        },
      };
      const params = utils.preparePlanParams(config)(
        {
          from: 'Kera, Espoo::60.217992,24.75494',
          to: 'Leppävaara, Espoo::60.219235,24.81329',
        },
        {
          location: {
            query: {},
          },
        },
      );

      const { modes } = params;
      expect(modes).to.equal('BUS,WALK');
    });

    it('should use the optimize mode from query', () => {
      const params = utils.preparePlanParams(defaultConfig)(
        {
          from: 'Kera, Espoo::60.217992,24.75494',
          to: 'Leppävaara, Espoo::60.219235,24.81329',
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
  });

  describe('getDefaultSettings', () => {
    it('should include a modes array', () => {
      const defaultSettings = utils.getDefaultSettings(defaultConfig);
      expect(Array.isArray(defaultSettings.modes)).to.equal(true);
    });
  });
});
