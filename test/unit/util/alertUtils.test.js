import { expect } from 'chai';
import { describe, it } from 'mocha';

import * as utils from '../../../app/util/alertUtils';

describe('alertUtils', () => {
  describe('routeHasServiceAlert', () => {
    it('should return false if route is undefined', () => {
      expect(utils.routeHasServiceAlert(undefined)).to.equal(false);
    });

    it('should return false if route has no array "alerts"', () => {
      expect(utils.routeHasServiceAlert({ alerts: undefined })).to.equal(false);
    });

    it('should return false if route has an empty alerts array', () => {
      expect(utils.routeHasServiceAlert({ alerts: [] })).to.equal(false);
    });

    it('should return true if route has a non-empty alerts array', () => {
      expect(utils.routeHasServiceAlert({ alerts: [{}] })).to.equal(true);
    });
  });

  describe('patternHasServiceAlert', () => {
    it('should return false if pattern is undefined', () => {
      expect(utils.patternHasServiceAlert(undefined)).to.equal(false);
    });

    it('should return true if the route related to the pattern has a non-empty alerts array', () => {
      expect(
        utils.patternHasServiceAlert({ route: { alerts: [{}] } }),
      ).to.equal(true);
    });
  });

  describe('stoptimeHasCancelation', () => {
    it('should return false if stoptime is undefined', () => {
      expect(utils.stoptimeHasCancelation(undefined)).to.equal(false);
    });

    it('should return false if stoptime has a non-matching realtimeState', () => {
      expect(
        utils.stoptimeHasCancelation({ realtimeState: 'SCHEDULED' }),
      ).to.equal(false);
    });

    it('should return true if stoptime has a matching realtimeState', () => {
      expect(
        utils.stoptimeHasCancelation({ realtimeState: 'CANCELED' }),
      ).to.equal(true);
    });
  });
});
