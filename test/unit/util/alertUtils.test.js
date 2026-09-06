import {
  AlertSeverityLevelType,
  RealtimeStateType,
  AlertEntityType,
} from '../../../app/constants';
import * as utils from '../../../app/util/alertUtils';

describe('alertUtils', () => {
  describe('stoptimeHasCancelation', () => {
    it('should return false if stoptime is undefined', () => {
      expect(utils.stoptimeHasCancelation(undefined)).toBe(false);
    });

    it('should return false if stoptime has a non-matching realtimeState', () => {
      expect(utils.stoptimeHasCancelation({ realtimeState: 'SCHEDULED' })).toBe(
        false,
      );
    });

    it('should return true if stoptime has a matching realtimeState', () => {
      expect(utils.stoptimeHasCancelation({ realtimeState: 'CANCELED' })).toBe(
        true,
      );
    });
  });

  describe('tripHasCancelation', () => {
    it('should return false if trip is undefined', () => {
      expect(utils.tripHasCancelation(undefined)).toBe(false);
    });

    it('should return false if trip has no array "stoptimes"', () => {
      expect(utils.tripHasCancelation({ stoptimes: undefined })).toBe(false);
    });

    it('should return false if only some of the stoptimes have been canceled', () => {
      expect(
        utils.tripHasCancelation({
          stoptimes: [
            { realtimeState: 'CANCELED' },
            { realtimeState: 'SCHEDULED' },
          ],
        }),
      ).toBe(false);
    });

    it('should return true if all of the stoptimes have been canceled', () => {
      expect(
        utils.tripHasCancelation({
          stoptimes: [
            { realtimeState: 'CANCELED' },
            { realtimeState: 'CANCELED' },
          ],
        }),
      ).toBe(true);
    });
  });

  describe('tripHasCancelationForStop', () => {
    it('should return false if trip is undefined', () => {
      expect(
        utils.tripHasCancelationForStop(undefined, { gtfsId: 'foo' }),
      ).toBe(false);
    });

    it('should return false if trip has no array "stoptimes"', () => {
      expect(utils.tripHasCancelationForStop({}, { gtfsId: 'foo' })).toBe(
        false,
      );
    });

    it('should return false if stop is undefined', () => {
      expect(
        utils.tripHasCancelationForStop(
          {
            stoptimes: [
              {
                realtimeState: RealtimeStateType.Canceled,
                stop: { gtfsId: 'foo' },
              },
            ],
          },
          undefined,
        ),
      ).toBe(false);
    });

    it('should return false if stop has no gtfsId', () => {
      expect(
        utils.tripHasCancelationForStop(
          {
            stoptimes: [
              {
                realtimeState: RealtimeStateType.Canceled,
                stop: { gtfsId: 'foo' },
              },
            ],
          },
          {},
        ),
      ).toBe(false);
    });

    it('should return true when there is a cancelation for the given stop', () => {
      expect(
        utils.tripHasCancelationForStop(
          {
            stoptimes: [
              {
                realtimeState: RealtimeStateType.Canceled,
                stop: { gtfsId: 'foo' },
              },
            ],
          },
          {
            gtfsId: 'foo',
          },
        ),
      ).toBe(true);
    });
  });

  describe('legHasCancelation', () => {
    it('should return false if leg is falsy', () => {
      expect(utils.legHasCancelation(undefined)).toBe(false);
    });

    it('should return false if the leg has not been canceled', () => {
      expect(
        utils.legHasCancelation({ realtimeState: RealtimeStateType.Scheduled }),
      ).toBe(false);
    });

    it('should return true if the leg has been canceled', () => {
      expect(
        utils.legHasCancelation({ realtimeState: RealtimeStateType.Canceled }),
      ).toBe(true);
    });
  });

  describe('getMaximumAlertSeverityLevel', () => {
    it('should return undefined if the alerts array is not an array', () => {
      expect(utils.getMaximumAlertSeverityLevel(undefined)).toBe(undefined);
    });

    it('should return undefined if the alerts array is empty', () => {
      expect(utils.getMaximumAlertSeverityLevel([])).toBe(undefined);
    });

    it('should return undefined if the severity level cannot be determined', () => {
      expect(utils.getMaximumAlertSeverityLevel([{ foo: 'bar' }])).toBe(
        undefined,
      );
    });

    it('should ignore alerts that are missing a severity level', () => {
      const alerts = [
        { foo: 'bar' },
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { foo: 'baz' },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).toBe(
        AlertSeverityLevelType.Info,
      );
    });

    it('should prioritize severe over warning', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Severe },
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).toBe(
        AlertSeverityLevelType.Severe,
      );
    });

    it('should prioritize warning over info', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).toBe(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should prioritize info over unknown', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { alertSeverityLevel: AlertSeverityLevelType.Unknown },
      ];
      expect(utils.getMaximumAlertSeverityLevel(alerts)).toBe(
        AlertSeverityLevelType.Info,
      );
    });
  });

  describe('isAlertValid', () => {
    it('should mark an alert missing its validity period as valid', () => {
      expect(utils.isAlertValid({}, 1)).toBe(true);
    });

    it('should mark an alert missing its validity start and end times as valid', () => {
      expect(
        utils.isAlertValid(
          { effectiveStartDate: null, effectiveEndDate: null },
          1000,
        ),
      ).toBe(true);
    });

    it('should mark an alert in the past as invalid', () => {
      expect(
        utils.isAlertValid(
          { effectiveStartDate: 1000, effectiveEndDate: 2000 },
          2500,
        ),
      ).toBe(false);
    });

    it('should mark a current alert as valid', () => {
      expect(
        utils.isAlertValid(
          { effectiveStartDate: 1000, effectiveEndDate: 2000 },
          1500,
        ),
      ).toBe(true);
    });

    it('should mark a current alert within DEFAULT_VALIDITY period as valid', () => {
      expect(
        utils.isAlertValid({ effectiveStartDate: 1000 }, 1100, {
          defaultValidity: 200,
        }),
      ).toBe(true);
    });

    it('should mark an alert after the DEFAULT_VALIDITY period as invalid', () => {
      expect(
        utils.isAlertValid({ effectiveStartDate: 1000 }, 1300, {
          defaultValidity: 200,
        }),
      ).toBe(false);
    });

    it('should mark an alert in the future as invalid', () => {
      expect(
        utils.isAlertValid(
          { effectiveStartDate: 1000, effectiveEndDate: 2000 },
          500,
        ),
      ).toBe(false);
    });

    it('should mark an alert as valid if the given reference time is not a number', () => {
      expect(
        utils.isAlertValid(
          { effectiveStartDate: 0, effectiveEndDate: 1000 },
          undefined,
        ),
      ).toBe(true);
    });

    it('should accept non-integer numbers', () => {
      expect(
        utils.isAlertValid(
          {
            effectiveStartDate: 1558904400,
            effectiveEndDate: 1559941140,
          },
          1558678507424 / 1000,
        ),
      ).toBe(false);
    });

    it('should return false if the alert itself is falsy', () => {
      expect(utils.isAlertValid(undefined, 0)).toBe(false);
    });

    it('should return true if the alert is in the future when configured', () => {
      expect(
        utils.isAlertValid(
          { effectiveStartDate: 100, effectiveEndDate: 100 },
          99,
          { isFutureValid: true },
        ),
      ).toBe(true);
    });
  });

  describe('getCancelationsForRoute', () => {
    it('should return an empty array if route is missing', () => {
      expect(utils.getCancelationsForRoute(undefined)).toEqual([]);
    });

    it('should return an empty array if route has no array "patterns"', () => {
      expect(utils.getCancelationsForRoute({ patterns: undefined })).toEqual(
        [],
      );
    });

    it('should return stoptimes with cancelations', () => {
      const route = {
        patterns: [
          {
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: RealtimeStateType.Canceled,
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(utils.getCancelationsForRoute(route)).toHaveLength(1);
    });

    it('should filter by patternId', () => {
      const route = {
        patterns: [
          {
            code: 'foo',
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: RealtimeStateType.Canceled,
                  },
                ],
              },
            ],
          },
          {
            code: 'bar',
            trips: [
              {
                stoptimes: [
                  {
                    realtimeState: RealtimeStateType.Canceled,
                  },
                ],
              },
            ],
          },
        ],
      };
      expect(utils.getCancelationsForRoute(route, 'foo')).toHaveLength(1);
    });
  });

  describe('checkActiveDisruptions', () => {
    it('should not crash even if cancelations or alerts is not defined', () => {
      expect(utils.checkActiveDisruptions(1, undefined, [])).toBe(false);
      expect(utils.checkActiveDisruptions(1, [], undefined)).toBe(false);
    });

    it('should return true if there is an active cancelation', () => {
      expect(
        utils.checkActiveDisruptions(50, [
          {
            realtimeState: RealtimeStateType.Canceled,
            scheduledArrival: 1,
            scheduledDeparture: 100,
            serviceDay: 0,
          },
        ]),
      ).toBe(true);
    });

    it('should return true if there is an active alert with no severity level', () => {
      expect(
        utils.checkActiveDisruptions(
          50,
          [],
          [
            {
              effectiveStartDate: 1,
              effectiveEndDate: 100,
            },
          ],
        ),
      ).toBe(true);
    });

    it('should return true if there is an active alert with a severity level !== INFO', () => {
      expect(
        utils.checkActiveDisruptions(
          50,
          [],
          [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              effectiveStartDate: 1,
              effectiveEndDate: 100,
            },
          ],
        ),
      ).toBe(true);
    });

    it('should return false if there is an active alert with a severity level === INFO', () => {
      expect(
        utils.checkActiveDisruptions(
          50,
          [],
          [
            {
              alertSeverityLevel: AlertSeverityLevelType.Info,
              effectiveStartDate: 1,
              effectiveEndDate: 100,
            },
          ],
        ),
      ).toBe(false);
    });

    it('should return false if there is an expired service alert', () => {
      expect(
        utils.checkActiveDisruptions(
          200,
          [],
          [
            {
              effectiveStartDate: 1,
              effectiveEndDate: 100,
            },
          ],
        ),
      ).toBe(false);
    });

    it('should return true by default for service alerts that have no start or end', () => {
      expect(utils.checkActiveDisruptions(200, [], [{}])).toBe(true);
    });
  });

  describe('cancelationHasExpired', () => {
    it('should return true for an expired cancelation', () => {
      const cancelation = {
        scheduledArrival: 10,
        scheduledDeparture: 20,
        serviceDay: 0,
      };
      expect(utils.cancelationHasExpired(25, cancelation)).toBe(true);
    });

    it('should return false for an active cancelation', () => {
      const cancelation = {
        scheduledArrival: 10,
        scheduledDeparture: 20,
        serviceDay: 0,
      };
      expect(utils.cancelationHasExpired(15, cancelation)).toBe(false);
    });

    it('should return false for a future cancelation', () => {
      const cancelation = {
        scheduledArrival: 10,
        scheduledDeparture: 10,
        serviceDay: 0,
      };
      expect(utils.cancelationHasExpired(5, cancelation)).toBe(false);
    });
  });

  describe('getCancelationsForStop', () => {
    it('should return an empty array if stop is missing', () => {
      expect(utils.getCancelationsForStop(undefined)).toEqual([]);
    });

    it('should return an empty array if stop has no array "stoptimes"', () => {
      expect(utils.getCancelationsForStop({ stoptimes: undefined })).toEqual(
        [],
      );
    });

    it('should return only canceled stoptimes', () => {
      const stop = {
        stoptimes: [
          {
            realtimeState: RealtimeStateType.Canceled,
          },
          {
            realtimeState: RealtimeStateType.Scheduled,
          },
          {
            realtimeState: RealtimeStateType.Updated,
          },
          {
            realtimeState: RealtimeStateType.Modified,
          },
          {
            realtimeState: undefined,
          },
        ],
      };
      expect(utils.getCancelationsForStop(stop)).toHaveLength(1);
    });
  });

  describe('getActiveLegAlertSeverityLevel', () => {
    it('should return undefined if the leg is falsy', () => {
      expect(utils.getActiveLegAlertSeverityLevel(undefined)).toBe(undefined);
    });

    it('should return "WARNING" if the leg is canceled', () => {
      const leg = {
        realtimeState: RealtimeStateType.Canceled,
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should return "WARNING" if there is an active route alert', () => {
      const alertEffectiveStartDate = 1553754595;
      const leg = {
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              effectiveEndDate: 1553778000,
              effectiveStartDate: alertEffectiveStartDate,
            },
          ],
        },
        start: {
          scheduledTime: new Date(
            alertEffectiveStartDate * 1000 + 1000,
          ).toISOString(),
        },
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should return undefined if there is an inactive route alert', () => {
      const alertEffectiveEndDate = 1553778000;
      const leg = {
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              effectiveEndDate: alertEffectiveEndDate,
              effectiveStartDate: 1553754595,
            },
          ],
        },
        start: {
          scheduledTime: new Date(
            alertEffectiveEndDate * 1000 + 1,
          ).toISOString(),
        },
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(undefined);
    });

    it('should return "WARNING" if there is an active route alert', () => {
      const leg = {
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
              effectiveEndDate: 1553778000,
              effectiveStartDate: 1553754595,
              entities: [
                {
                  __typename: AlertEntityType.Route,
                },
              ],
            },
          ],
        },
        start: { scheduledTime: new Date(1553769600000).toISOString() },
        trip: {
          pattern: {
            code: 'HSL:3001I:0:01',
          },
        },
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should return "WARNING" if there is an active stop alert at the "from" stop', () => {
      const leg = {
        from: {
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                effectiveEndDate: 1553778000,
                effectiveStartDate: 1553754595,
              },
            ],
          },
        },
        start: { scheduledTime: new Date(1553769600000).toISOString() },
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should return "WARNING" if there is an active stop alert at the "to" stop', () => {
      const leg = {
        to: {
          stop: {
            alerts: [
              {
                alertSeverityLevel: AlertSeverityLevelType.Warning,
                effectiveEndDate: 1553778000,
                effectiveStartDate: 1553754595,
              },
            ],
          },
        },
        start: { scheduledTime: new Date(1553769600000).toISOString() },
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(
        AlertSeverityLevelType.Warning,
      );
    });

    it('should not return "WARNING" if there is an active stop alert at an intermediate stop', () => {
      const leg = {
        intermediatePlaces: [
          {
            stop: {
              alerts: [
                {
                  alertSeverityLevel: AlertSeverityLevelType.Warning,
                  effectiveEndDate: 1553778000,
                  effectiveStartDate: 1553754595,
                },
              ],
            },
          },
        ],
        start: { scheduledTime: new Date(1553769600000).toISOString() },
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(undefined);
    });

    it('should return the given alertSeverityLevel', () => {
      const leg = {
        route: {
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Info,
              effectiveEndDate: 1553778000,
              effectiveStartDate: 1553754595,
            },
          ],
        },
        start: { scheduledTime: new Date(1553769600000).toISOString() },
      };
      expect(utils.getActiveLegAlertSeverityLevel(leg)).toBe(
        AlertSeverityLevelType.Info,
      );
    });
  });

  describe('getActiveAlertSeverityLevel', () => {
    it('should return undefined if there are no current alerts', () => {
      const alerts = [
        {
          alertSeverityLevel: AlertSeverityLevelType.Info,
          effectiveEndDate: 1559941140,
          effectiveStartDate: 1558904400,
        },
      ];
      const currentTime = 1558599526;
      expect(utils.getActiveAlertSeverityLevel(alerts, currentTime)).toBe(
        undefined,
      );
    });

    it('should return the severity level if there are no effective dates available', () => {
      const alerts = [
        {
          alertSeverityLevel: AlertSeverityLevelType.Info,
          effectiveEndDate: null,
          effectiveStartDate: null,
        },
      ];
      const currentTime = 1558599526;
      expect(utils.getActiveAlertSeverityLevel(alerts, currentTime)).toBe(
        AlertSeverityLevelType.Info,
      );
    });

    it('should ignore falsy alerts', () => {
      const currentTime = 1000;
      const alerts = [
        undefined,
        {
          alertSeverityLevel: AlertSeverityLevelType.Info,
          effectiveStartDate: currentTime - 100,
          effectiveEndDate: currentTime + 100,
        },
      ];
      expect(utils.getActiveAlertSeverityLevel(alerts, currentTime)).toBe(
        AlertSeverityLevelType.Info,
      );
    });
  });

  describe('alertSeverityCompare', () => {
    it('should sort alerts SEVERE alerts first', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
        { alertSeverityLevel: AlertSeverityLevelType.Severe },
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { alertSeverityLevel: AlertSeverityLevelType.Severe },
        { alertSeverityLevel: 'foo' },
      ];
      const sortedAlerts = alerts.sort(utils.alertSeverityCompare);
      expect(sortedAlerts[0].alertSeverityLevel).toBe(
        AlertSeverityLevelType.Severe,
      );
    });

    it('should sort alerts WARNING alerts first if there are no SEVERE alerts', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Unknown },
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
        { alertSeverityLevel: AlertSeverityLevelType.Info },
        { alertSeverityLevel: 'foo' },
      ];
      const sortedAlerts = alerts.sort(utils.alertSeverityCompare);
      expect(sortedAlerts[0].alertSeverityLevel).toBe(
        AlertSeverityLevelType.Warning,
      );
    });
  });

  describe('hasMeaningfulData', () => {
    it('should return false if there are no alerts', () => {
      const alerts = [];
      expect(utils.hasMeaningfulData(alerts)).toBe(false);
    });
    it('should return true if header or description present', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
        {
          alertSeverityLevel: AlertSeverityLevelType.Severe,
          alertDescriptionText: 'foo',
        },
      ];
      expect(utils.hasMeaningfulData(alerts)).toBe(true);
    });
    it('should return false if neither header or description are present', () => {
      const alerts = [
        { alertSeverityLevel: AlertSeverityLevelType.Warning },
        { alertSeverityLevel: AlertSeverityLevelType.Severe },
      ];
      expect(utils.hasMeaningfulData(alerts)).toBe(false);
    });
    it('should return false if no meaningful data is included in header or description fields', () => {
      const alerts = [
        {
          alertSeverityLevel: AlertSeverityLevelType.Warning,
          alertDescriptionText: 'meaningful but not priority',
        },
        {
          alertSeverityLevel: AlertSeverityLevelType.Severe,
          alertDescriptionText: '',
          alertHeaderText: '',
        },
      ];
      expect(utils.hasMeaningfulData(alerts)).toBe(false);
    });
  });
});
