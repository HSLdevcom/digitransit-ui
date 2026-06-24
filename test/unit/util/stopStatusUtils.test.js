import { expect } from 'chai';
import { describe, it } from 'mocha';

import getStopStatus, {
  STOP_STATUS,
  getStopStatusFromStopData,
  severityToStatus,
  combineStopStatuses,
  resolveNoDeparturesBadge,
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

    it('maps non-info levels to the ALERT status', () => {
      expect(severityToStatus('WARNING')).to.equal(STOP_STATUS.ALERT);
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

  describe('getStopStatusFromStopData', () => {
    const NOW = 1_700_000_000;

    it('returns a null status when stop status markers are disabled', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [],
          serviceToday: [],
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
          serviceToday: [{ serviceDay: NOW }],
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
          serviceToday: [{ serviceDay: NOW }],
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
          serviceToday: [],
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
          serviceToday: [],
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
          serviceToday: [{ serviceDay: NOW }],
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
          serviceToday: [{ serviceDay: NOW }],
          stoptimesWithoutPatterns: [],
        },
        nowUnixTime: NOW,
        showStopStatusMarkers: true,
      });
      expect(result).to.equal(null);
    });
  });

  describe('resolveNoDeparturesBadge', () => {
    const NOW = 1_700_000_000;
    const makeAlert = (alertSeverityLevel, alertEffect = null) => ({
      alertSeverityLevel,
      alertEffect,
      effectiveStartDate: 0,
      effectiveEndDate: 9_999_999_999,
    });

    it('returns all nulls when showStopStatusMarkers is false', () => {
      const result = resolveNoDeparturesBadge([], NOW, false, false);
      expect(result).to.deep.equal({
        stopStatus: null,
        badgeImg: null,
        alertEffects: null,
      });
    });

    it('returns OUT_OF_SERVICE for a NO_SERVICE alert', () => {
      const result = resolveNoDeparturesBadge(
        [makeAlert('WARNING', 'NO_SERVICE')],
        NOW,
        true,
        true,
      );
      expect(result.stopStatus).to.equal(STOP_STATUS.OUT_OF_SERVICE);
      expect(result.alertEffects).to.equal(null);
    });

    it('returns ALERT status with effects for a warning alert', () => {
      const result = resolveNoDeparturesBadge(
        [makeAlert('WARNING', 'DETOUR')],
        NOW,
        true,
        false,
      );
      expect(result.stopStatus).to.equal(STOP_STATUS.ALERT);
      expect(result.alertEffects).to.deep.equal(['DETOUR']);
    });

    it('returns OUT_OF_SERVICE when no alerts and no future service', () => {
      const result = resolveNoDeparturesBadge([], NOW, true, false);
      expect(result.stopStatus).to.equal(STOP_STATUS.OUT_OF_SERVICE);
      expect(result.alertEffects).to.equal(null);
    });

    it('returns NO_SERVICE_TODAY when no alerts but future service exists', () => {
      const result = resolveNoDeparturesBadge([], NOW, true, true);
      expect(result.stopStatus).to.equal(STOP_STATUS.NO_SERVICE_TODAY);
    });

    it('returns NO_SERVICE_TODAY when servicesRunningInFuture is undefined (data unavailable)', () => {
      const result = resolveNoDeparturesBadge([], NOW, true, undefined);
      expect(result.stopStatus).to.equal(STOP_STATUS.NO_SERVICE_TODAY);
    });
  });
});
