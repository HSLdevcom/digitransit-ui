import { expect } from 'chai';
import { describe, it } from 'mocha';
import { preparePlanParams } from '../../app/util/planParamUtil';

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
      const params = preparePlanParams(config)(
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
  });
});
