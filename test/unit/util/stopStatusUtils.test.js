import { expect } from 'chai';
import { describe, it } from 'mocha';

import getStopStatus, {
  STOP_STATUS,
  getStopStatusFromStopData,
  getStopAlertEffect,
  severityToStatus,
  combineStopStatuses,
} from '../../../app/util/stopStatusUtils';

describe('stopStatusUtils', () => {
  describe('getStopStatus', () => {
    it('returns null when stop status markers are disabled', () => {
      const result = getStopStatus({
        showStopStatusMarkers: false,
        closedByServiceAlert: true,
        servicesRunningOnServiceDate: false,
        servicesRunningInFuture: false,
      });
      expect(result).to.equal(null);
    });

    it('returns OUT_OF_SERVICE when the stop is closed by a service alert', () => {
      const result = getStopStatus({
        showStopStatusMarkers: true,
        closedByServiceAlert: true,
        servicesRunningOnServiceDate: true,
        servicesRunningInFuture: true,
      });
      expect(result).to.equal(STOP_STATUS.OUT_OF_SERVICE);
    });

    it('returns OUT_OF_SERVICE when no services run today or in the future', () => {
      const result = getStopStatus({
        showStopStatusMarkers: true,
        closedByServiceAlert: false,
        servicesRunningOnServiceDate: false,
        servicesRunningInFuture: false,
      });
      expect(result).to.equal(STOP_STATUS.OUT_OF_SERVICE);
    });

    it('returns NO_SERVICE_TODAY when no services run today but services run in the future', () => {
      const result = getStopStatus({
        showStopStatusMarkers: true,
        closedByServiceAlert: false,
        servicesRunningOnServiceDate: false,
        servicesRunningInFuture: true,
      });
      expect(result).to.equal(STOP_STATUS.NO_SERVICE_TODAY);
    });

    it('returns null when services run today', () => {
      const result = getStopStatus({
        showStopStatusMarkers: true,
        closedByServiceAlert: false,
        servicesRunningOnServiceDate: true,
        servicesRunningInFuture: true,
      });
      expect(result).to.equal(null);
    });

    it('returns ALERT for a warning-level alert when services run normally', () => {
      const result = getStopStatus({
        showStopStatusMarkers: true,
        closedByServiceAlert: false,
        servicesRunningOnServiceDate: true,
        servicesRunningInFuture: true,
        alertSeverityLevel: 'WARNING',
      });
      expect(result).to.equal(STOP_STATUS.ALERT);
    });

    it('prioritises no-service-today over an active alert', () => {
      const result = getStopStatus({
        showStopStatusMarkers: true,
        closedByServiceAlert: false,
        servicesRunningOnServiceDate: false,
        servicesRunningInFuture: true,
        alertSeverityLevel: 'WARNING',
      });
      expect(result).to.equal(STOP_STATUS.NO_SERVICE_TODAY);
    });
  });

  describe('severityToStatus', () => {
    it('maps INFO to the INFO status', () => {
      expect(severityToStatus('INFO')).to.equal(STOP_STATUS.INFO);
    });

    it('maps warning, severe and unknown levels to the ALERT status', () => {
      expect(severityToStatus('WARNING')).to.equal(STOP_STATUS.ALERT);
      expect(severityToStatus('SEVERE')).to.equal(STOP_STATUS.ALERT);
      expect(severityToStatus('UNKNOWN_SEVERITY')).to.equal(STOP_STATUS.ALERT);
    });

    it('returns null when there is no severity level', () => {
      expect(severityToStatus(undefined)).to.equal(null);
    });
  });

  describe('combineStopStatuses', () => {
    it('returns the shared status when both stops match', () => {
      expect(
        combineStopStatuses(
          STOP_STATUS.NO_SERVICE_TODAY,
          STOP_STATUS.NO_SERVICE_TODAY,
        ),
      ).to.equal(STOP_STATUS.NO_SERVICE_TODAY);
    });

    it('returns ALERT when the statuses differ but both are red-level', () => {
      expect(
        combineStopStatuses(STOP_STATUS.OUT_OF_SERVICE, STOP_STATUS.ALERT),
      ).to.equal(STOP_STATUS.ALERT);
    });

    it('returns INFO when the statuses differ and are not both red-level', () => {
      expect(
        combineStopStatuses(
          STOP_STATUS.OUT_OF_SERVICE,
          STOP_STATUS.NO_SERVICE_TODAY,
        ),
      ).to.equal(STOP_STATUS.INFO);
    });

    it('returns the non-null status when only one stop has a status', () => {
      expect(combineStopStatuses(STOP_STATUS.OUT_OF_SERVICE, null)).to.equal(
        STOP_STATUS.OUT_OF_SERVICE,
      );
      expect(combineStopStatuses(null, STOP_STATUS.ALERT)).to.equal(
        STOP_STATUS.ALERT,
      );
    });

    it('returns null when both stops have no status', () => {
      expect(combineStopStatuses(null, null)).to.equal(null);
    });
  });

  describe('getStopAlertEffect', () => {
    const NOW = 1_700_000_000;

    it('returns the effect of the active alert', () => {
      const effect = getStopAlertEffect(
        [
          {
            alertSeverityLevel: 'WARNING',
            alertEffect: 'DETOUR',
            effectiveStartDate: NOW - 100,
            effectiveEndDate: NOW + 100,
          },
        ],
        NOW,
      );
      expect(effect).to.equal('DETOUR');
    });

    it('returns the effect of the highest-severity active alert', () => {
      const effect = getStopAlertEffect(
        [
          {
            alertSeverityLevel: 'INFO',
            alertEffect: 'MODIFIED_SERVICE',
            effectiveStartDate: NOW - 100,
            effectiveEndDate: NOW + 100,
          },
          {
            alertSeverityLevel: 'SEVERE',
            alertEffect: 'SIGNIFICANT_DELAYS',
            effectiveStartDate: NOW - 100,
            effectiveEndDate: NOW + 100,
          },
        ],
        NOW,
      );
      expect(effect).to.equal('SIGNIFICANT_DELAYS');
    });

    it('returns null when there is no active alert', () => {
      const effect = getStopAlertEffect(
        [
          {
            alertSeverityLevel: 'WARNING',
            alertEffect: 'DETOUR',
            effectiveStartDate: NOW - 200,
            effectiveEndDate: NOW - 100,
          },
        ],
        NOW,
      );
      expect(effect).to.equal(null);
    });
  });

  describe('getStopStatusFromStopData', () => {
    const NOW = 1_700_000_000;

    it('returns a null status when stop status markers are disabled', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [],
          stoptimesForServiceDate: [],
          stoptimesWithoutPatterns: [],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: false,
      });
      expect(result).to.equal(null);
    });

    it('returns a null status when stop data is missing', () => {
      const result = getStopStatusFromStopData({
        stop: null,
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(null);
    });

    it('returns OUT_OF_SERVICE when a valid NO_SERVICE alert is active', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [
            {
              alertEffect: 'NO_SERVICE',
              effectiveStartDate: NOW - 100,
              effectiveEndDate: NOW + 100,
            },
          ],
          stoptimesForServiceDate: [{ stoptimes: [{ serviceDay: NOW }] }],
          stoptimesWithoutPatterns: [{ serviceDay: NOW }],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(STOP_STATUS.OUT_OF_SERVICE);
    });

    it('ignores an expired NO_SERVICE alert', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [
            {
              alertEffect: 'NO_SERVICE',
              effectiveStartDate: NOW - 200,
              effectiveEndDate: NOW - 100,
            },
          ],
          stoptimesForServiceDate: [{ stoptimes: [{ serviceDay: NOW }] }],
          stoptimesWithoutPatterns: [{ serviceDay: NOW }],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(null);
    });

    it('returns OUT_OF_SERVICE when there are no departures today or in the future', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [],
          stoptimesForServiceDate: [{ stoptimes: [] }],
          stoptimesWithoutPatterns: [],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(STOP_STATUS.OUT_OF_SERVICE);
    });

    it('returns NO_SERVICE_TODAY when there are no departures today but some in the future', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [],
          stoptimesForServiceDate: [{ stoptimes: [] }],
          stoptimesWithoutPatterns: [{ serviceDay: NOW }],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(STOP_STATUS.NO_SERVICE_TODAY);
    });

    it('returns ALERT for an active warning alert', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [
            {
              alertEffect: 'SIGNIFICANT_DELAYS',
              alertSeverityLevel: 'WARNING',
              effectiveStartDate: NOW - 100,
              effectiveEndDate: NOW + 100,
            },
          ],
          stoptimesForServiceDate: [{ stoptimes: [{ serviceDay: NOW }] }],
          stoptimesWithoutPatterns: [{ serviceDay: NOW }],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(STOP_STATUS.ALERT);
    });

    it('returns a null status when departures run today even if none run in the future', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [],
          stoptimesForServiceDate: [{ stoptimes: [{ serviceDay: NOW }] }],
          stoptimesWithoutPatterns: [],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(null);
    });
  });
});
