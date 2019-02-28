import {
  AlertEffectType,
  AlertSeverityLevelType,
  RealtimeStateType,
} from '../../../app/constants';
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

  describe('legHasCancelation', () => {
    it('should return false if leg is falsy', () => {
      expect(utils.legHasCancelation(undefined)).to.equal(false);
    });

    it('should return false if the leg has not been canceled', () => {
      expect(
        utils.legHasCancelation({ realtimeState: RealtimeStateType.Scheduled }),
      ).to.equal(false);
    });

    it('should return true if the leg has been canceled', () => {
      expect(
        utils.legHasCancelation({ realtimeState: RealtimeStateType.Canceled }),
      ).to.equal(true);
    });
  });

  describe('itineraryHasCancelation', () => {
    it('should return false if itinerary is falsy', () => {
      expect(utils.itineraryHasCancelation(undefined)).to.equal(false);
    });

    it('should return false if itinerary has no array "legs"', () => {
      expect(utils.itineraryHasCancelation({ legs: undefined })).to.equal(
        false,
      );
    });

    it('should return false if none of the legs has a cancelation', () => {
      expect(
        utils.itineraryHasCancelation({
          legs: [
            { realtimeState: RealtimeStateType.Added },
            { realtimeState: RealtimeStateType.Modified },
            { realtimeState: RealtimeStateType.Scheduled },
            { realtimeState: RealtimeStateType.Updated },
          ],
        }),
      ).to.equal(false);
    });

    it('should return true if at least one of the legs has been canceled', () => {
      expect(
        utils.itineraryHasCancelation({
          legs: [
            { realtimeState: RealtimeStateType.Scheduled },
            { realtimeState: RealtimeStateType.Canceled },
          ],
        }),
      ).to.equal(true);
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

  describe('stopHasServiceAlert', () => {
    it('should return false if stop is undefined', () => {
      expect(utils.stopHasServiceAlert(undefined)).to.equal(false);
    });

    it('should return false if stop has no array "alerts"', () => {
      expect(utils.stopHasServiceAlert({ alerts: undefined })).to.equal(false);
    });

    it('should return false if stop has an empty alerts array', () => {
      expect(utils.stopHasServiceAlert({ alerts: [] })).to.equal(false);
    });

    it('should return true if stop has a non-empty alerts array', () => {
      expect(utils.stopHasServiceAlert({ alerts: [{}] })).to.equal(true);
    });
  });

  describe('getMaximumAlertSeverityLevel', () => {
    it('should return undefined if the alerts array is not an array', () => {
      expect(utils.getMaximumAlertSeverityLevel(undefined)).to.equal(undefined);
    });

    it('should return undefined if the alerts array is empty', () => {
      expect(utils.getMaximumAlertSeverityLevel([])).to.equal(undefined);
    });

    it('should return undefined if the severity level cannot be determined', () => {
      expect(utils.getMaximumAlertSeverityLevel([{ foo: 'bar' }])).to.equal(
        undefined,
      );
    });

    it('should ignore alerts that are missing a severity level', () => {
      const alerts = [
        { foo: 'bar' },
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { foo: 'baz' },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).to.equal(
        AlertSeverityLevelType.Info,
      );
    });

    it('should prioritize severe over warning', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Severe },
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).to.equal(
        AlertSeverityLevelType.Severe,
      );
    });

    it('should prioritize warning over info', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).to.equal(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should prioritize info over unknown', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { alertSeverityLevel: AlertSeverityLevelType.Unknown },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).to.equal(
        AlertSeverityLevelType.Info,
      );
    });
  });

  describe('getMaximumAlertEffect', () => {
    it('should return undefined if the alerts array is not an array', () => {
      expect(utils.getMaximumAlertEffect(undefined)).to.equal(undefined);
    });

    it('should return undefined if the alerts array is empty', () => {
      expect(utils.getMaximumAlertEffect([])).to.equal(undefined);
    });

    it('should return undefined if the effect cannot be determined', () => {
      expect(utils.getMaximumAlertEffect([{ foo: 'bar' }])).to.equal(undefined);
    });

    it('should ignore alerts that are missing an effect', () => {
      const alerts = [
        { foo: 'bar' },
        { alertEffect: AlertEffectType.NoService },
        { foo: 'baz' },
      ];
      expect(utils.getMaximumAlertEffect(alerts)).to.equal(
        AlertEffectType.NoService,
      );
    });

    it('should prioritize no service over everything else', () => {
      const alerts = [
        { alertEffect: AlertEffectType.AdditionalService },
        { alertEffect: AlertEffectType.Detour },
        { alertEffect: AlertEffectType.ModifiedService },
        { alertEffect: AlertEffectType.NoEffect },
        { alertEffect: AlertEffectType.NoService },
        { alertEffect: AlertEffectType.OtherEffect },
        { alertEffect: AlertEffectType.ReducedService },
        { alertEffect: AlertEffectType.SignificantDelays },
        { alertEffect: AlertEffectType.StopMoved },
        { alertEffect: AlertEffectType.Unknown },
      ];
      expect(utils.getMaximumAlertEffect(alerts)).to.equal(
        AlertEffectType.NoService,
      );
    });

    it('should return unknown if there are no alerts with the effect of no service', () => {
      const alerts = [
        { alertEffect: AlertEffectType.AdditionalService },
        { alertEffect: AlertEffectType.Detour },
        { alertEffect: AlertEffectType.ModifiedService },
        { alertEffect: AlertEffectType.NoEffect },
        { alertEffect: AlertEffectType.OtherEffect },
        { alertEffect: AlertEffectType.ReducedService },
        { alertEffect: AlertEffectType.SignificantDelays },
        { alertEffect: AlertEffectType.StopMoved },
        { alertEffect: AlertEffectType.Unknown },
      ];
      expect(utils.getMaximumAlertEffect(alerts)).to.equal(
        AlertEffectType.Unknown,
      );
    });
  });
});
