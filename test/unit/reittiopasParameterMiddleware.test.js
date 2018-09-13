import { expect } from 'chai';
import { describe, it } from 'mocha';
import { validateParams } from '../../server/reittiopasParameterMiddleware';

import config from '../../app/configurations/config.default';

const req = {
  query: {
    minTransferTime: '60',
    modes: 'BUS,TRAM,RAIL,SUBWAY,FERRY,WALK,CITYBIKE',
    transferPenalty: '0',
    walkBoardCost: '540',
    walkReluctance: '1.5',
    walkSpeed: '1.5',
  },
};

// validateParams returns an url if it is modified and it removes invalid
// parameteres from req.query => two ways to check if it did what it should

describe('reittiopasParameterMiddleware', () => {
  describe('validateParams', () => {
    it('should not modify valid url', () => {
      const url = validateParams(req, config);
      expect(url).to.be.a('undefined');
    });

    it('should remove invalid time parameter', () => {
      req.query.time = 'test';
      validateParams(req, config);
      expect(req.query.time).to.be.an('undefined');
    });

    it('should remove invalid modes parameter', () => {
      const properModes = req.query.modes;
      validateParams(req, config);
      expect(req.query.modes).to.equal(properModes);

      req.query.modes = 'test1,test2';
      validateParams(req, config);
      expect(req.query.modes).to.be.an('undefined');
    });
  });
});
