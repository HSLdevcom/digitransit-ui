import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createMemoryHistory } from 'react-router';
import * as utils from '../../app/util/queryUtils';

describe('queryUtils', () => {
  describe('getIntermediatePlaces', () => {
    it('should return an empty array for missing query', () => {
      const query = null;
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return an empty array for missing intermediatePlaces', () => {
      const query = {};
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return an empty array for whitespace intermediatePlaces', () => {
      const query = {
        intermediatePlaces: ' ',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });

    it('should return a location parsed from a string-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: 'Kera, Espoo::60.217992,24.75494',
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(1);
      expect(result[0].address).to.equal('Kera, Espoo');
      expect(result[0].lat).to.equal(60.217992);
      expect(result[0].lon).to.equal(24.75494);
    });

    it('should return locations parsed from an array-mode intermediatePlaces', () => {
      const query = {
        intermediatePlaces: [
          'Kera, Espoo::60.217992,24.75494',
          'Leppävaara, Espoo::60.219235,24.81329',
        ],
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(2);
      expect(result[0].address).to.equal('Kera, Espoo');
      expect(result[0].lat).to.equal(60.217992);
      expect(result[0].lon).to.equal(24.75494);
      expect(result[1].address).to.equal('Leppävaara, Espoo');
      expect(result[1].lat).to.equal(60.219235);
      expect(result[1].lon).to.equal(24.81329);
    });

    it('should return an empty array if intermediatePlaces is neither a string nor an array', () => {
      const query = {
        intermediatePlaces: {},
      };
      const result = utils.getIntermediatePlaces(query);
      expect(Array.isArray(result)).to.equal(true);
      expect(result.length).to.equal(0);
    });
  });

  describe('setIntermediatePlaces', () => {
    it('should not modify the query if the parameter is neither a string nor an array', () => {
      const router = createMemoryHistory();
      utils.setIntermediatePlaces(router, {});
      const { intermediatePlaces } = router.getCurrentLocation().query;
      expect(intermediatePlaces).to.equal(undefined);
    });

    it('should not modify the query if the parameter is an array but not a string array', () => {
      const router = createMemoryHistory();
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

      utils.setIntermediatePlaces(router, intermediatePlaces);

      expect(router.getCurrentLocation().query.intermediatePlaces).to.equal(
        undefined,
      );
    });

    it('should modify the query if the parameter is a string', () => {
      const router = createMemoryHistory();
      const intermediatePlace = 'Kera, Espoo::60.217992,24.75494';

      utils.setIntermediatePlaces(router, intermediatePlace);

      expect(router.getCurrentLocation().query.intermediatePlaces).to.equal(
        intermediatePlace,
      );
    });

    it('should modify the query if the parameter is a string array', () => {
      const router = createMemoryHistory();
      const intermediatePlaces = [
        'Kera, Espoo::60.217992,24.75494',
        'Leppävaara, Espoo::60.219235,24.81329',
      ];

      utils.setIntermediatePlaces(router, intermediatePlaces);

      expect(
        router.getCurrentLocation().query.intermediatePlaces,
      ).to.deep.equal(intermediatePlaces);
    });
  });
});
