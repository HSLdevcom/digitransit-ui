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

  describe('tripHasCancelation', () => {
    it('should return false if trip is undefined', () => {
      expect(utils.tripHasCancelation(undefined)).to.equal(false);
    });

    it('should return false if trip has no array "stoptimes"', () => {
      expect(utils.tripHasCancelation({ stoptimes: undefined })).to.equal(
        false,
      );
    });

    it('should return false if only some of the stoptimes have been canceled', () => {
      expect(
        utils.tripHasCancelation({
          stoptimes: [
            { realtimeState: 'CANCELED' },
            { realtimeState: 'SCHEDULED' },
          ],
        }),
      ).to.equal(false);
    });

    it('should return true if all of the stoptimes have been canceled', () => {
      expect(
        utils.tripHasCancelation({
          stoptimes: [
            { realtimeState: 'CANCELED' },
            { realtimeState: 'CANCELED' },
          ],
        }),
      ).to.equal(true);
    });
  });

  describe('patternHasCancelation', () => {
    it('should return false if pattern is undefined', () => {
      expect(utils.patternHasCancelation(undefined)).to.equal(false);
    });

    it('should return false if pattern has no array "trips"', () => {
      expect(utils.patternHasCancelation({ trips: undefined })).to.equal(false);
    });

    it('should return true if one of the trips has been canceled', () => {
      const pattern = {
        trips: [
          {
            stoptimes: [
              {
                realtimeState: 'CANCELED',
              },
            ],
          },
        ],
      };
      expect(utils.patternHasCancelation(pattern)).to.equal(true);
    });
  });

  describe('routeHasCancelation', () => {
    it('should return false if route is undefined', () => {
      expect(utils.routeHasCancelation(undefined)).to.equal(false);
    });

    it('should return false if route has no array "patterns"', () => {
      expect(utils.routeHasCancelation({ patterns: undefined })).to.equal(
        false,
      );
    });

    it('should return true if one of the patterns has been canceled', () => {
      const route = {
        patterns: [
          {
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: 'CANCELED',
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(utils.routeHasCancelation(route)).to.equal(true);
    });

    it('should return true if a matching pattern has been canceled', () => {
      const route = {
        patterns: [
          {
            code: 'foo',
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: 'CANCELED',
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(utils.routeHasCancelation(route, 'foo')).to.equal(true);
    });
  });

  describe('getServiceAlertHeader', () => {
    it('should return an empty string if there are no translations and no alertHeaderText', () => {
      expect(utils.getServiceAlertHeader({})).to.equal('');
      expect(
        utils.getServiceAlertHeader({
          alertHeaderTextTranslations: [],
        }),
      ).to.equal('');
    });

    it('should return alertHeaderText if there are no translations', () => {
      const alert = {
        alertHeaderText: 'foo',
      };
      expect(utils.getServiceAlertHeader(alert)).to.equal('foo');
    });

    it('should return a matching translation', () => {
      const alert = {
        alertHeaderTextTranslations: [
          {
            language: 'fi',
            text: 'Testi',
          },
        ],
      };
      expect(utils.getServiceAlertHeader(alert, 'fi')).to.equal('Testi');
    });

    it('should return the English translation if no other matches are found', () => {
      const alert = {
        alertHeaderTextTranslations: [
          {
            language: 'en',
            text: 'Test',
          },
          {
            language: 'fi',
            text: 'Testi',
          },
        ],
      };
      expect(utils.getServiceAlertHeader(alert, 'sv')).to.equal('Test');
    });

    it('should return the "multi-language translation" if no direct matches are found', () => {
      const alert = {
        alertHeaderTextTranslations: [
          {
            text: 'Testi/Test',
          },
          {
            text: 'Test',
            language: 'en',
          },
        ],
      };
      expect(utils.getServiceAlertHeader(alert, 'fi')).to.equal('Testi/Test');
    });
  });

  describe('getServiceAlertDescription', () => {
    it('should return an empty string if there are no translations and no alertDescriptionText', () => {
      const alert = {};
      expect(utils.getServiceAlertDescription(alert)).to.equal('');
    });

    it('should return alertDescriptionText if there are no translations', () => {
      const alert = {
        alertDescriptionText: 'foo',
      };
      expect(utils.getServiceAlertDescription(alert)).to.equal('foo');
    });
  });

  describe('getServiceAlertsForRoute', () => {
    it('should return an empty array if the route has no array "alerts"', () => {
      expect(
        utils.getServiceAlertsForRoute({ alerts: undefined }),
      ).to.deep.equal([]);
    });
  });
});
