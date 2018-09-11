import { expect } from 'chai';
import { describe, it } from 'mocha';
import { validateParams } from '../../server/reittiopasParameterMiddleware';

import data from './test-data/dt2730';

// validateParams returns an url if it is modified and it removes invalid
// parameteres from req.query => two ways to check if it did what it should

describe('reittiopasParameterMiddleware', () => {
  describe('validateParams', () => {
    it('should not modify valid url', () => {
      const url = validateParams(data.req, data.config);
      expect(url).to.be.a('undefined');
    });

    it('should remove invalid time parameter', () => {
      data.req.query.time = 'test';
      validateParams(data.req, data.config);
      expect(data.req.query.time).to.be.an('undefined');
    });

    it('should remove invalid modes parameter', () => {
      data.req.query.modes = 'test1,test2';
      validateParams(data.req, data.config);
      expect(data.req.query.modes).to.be.an('undefined');
    });
  });
});
