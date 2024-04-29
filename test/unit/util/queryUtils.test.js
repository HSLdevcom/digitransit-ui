import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockMatch } from '../helpers/mock-router';

import * as utils from '../../../app/util/queryUtils';

describe('queryUtils', () => {
  describe('setIntermediatePlaces', () => {
    it('should not modify the query if the parameter is neither a string nor an array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      utils.setIntermediatePlaces(router, mockMatch, {});
      expect(callParams).to.equal(undefined);
    });

    it('should not modify the query if the parameter is an array but not a string array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlaces = [
        {
          lat: 60.217992,
          lon: 24.75494,
          address: 'Kera, Espoo',
        },
        {
          lat: 60.219235,
          lon: 24.81329,
          address: 'Leppävaara, Espoo',
        },
      ];

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlaces);

      expect(callParams).to.equal(undefined);
    });

    it('should modify the query if the parameter is a string', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlace = 'Kera, Espoo::60.217992,24.75494';

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlace);

      expect(callParams.query.intermediatePlaces).to.equal(intermediatePlace);
    });

    it('should modify the query if the parameter is a string array', () => {
      let callParams;
      const router = {
        replace: params => {
          callParams = params;
        },
      };
      const intermediatePlaces = [
        'Kera, Espoo::60.217992,24.75494',
        'Leppävaara, Espoo::60.219235,24.81329',
      ];

      utils.setIntermediatePlaces(router, mockMatch, intermediatePlaces);

      expect(callParams.query.intermediatePlaces).to.deep.equal(
        intermediatePlaces,
      );
    });
  });
});
