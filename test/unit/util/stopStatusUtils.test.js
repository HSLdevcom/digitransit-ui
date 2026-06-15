import { expect } from 'chai';
import { describe, it } from 'mocha';

import getStopStatus, {
  STOP_STATUS,
  getStopStatusFromStopData,
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
  });

  describe('getStopStatusFromStopData', () => {
    const NOW = 1_700_000_000;

    it('returns null when stop status markers are disabled', () => {
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

    it('returns null when stop data is missing', () => {
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

    it('ignores alerts whose effect is not NO_SERVICE', () => {
      const result = getStopStatusFromStopData({
        stop: {
          alerts: [
            {
              alertEffect: 'SIGNIFICANT_DELAYS',
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

    it('returns null when departures run today even if none run in the future', () => {
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
