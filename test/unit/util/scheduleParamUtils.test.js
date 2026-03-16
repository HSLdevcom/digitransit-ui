import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { DateTime, Settings } from 'luxon';

import { calculateRedirectDecision } from '../../../app/component/routepage/schedule/scheduleParamUtils';
import { routePagePath, PREFIX_TIMETABLE } from '../../../app/util/path';
import { DATE_FORMAT } from '../../../app/constants';

describe('scheduleParamUtils', () => {
  describe('calculateRedirectDecision', () => {
    const fixedNow = DateTime.fromISO('2024-01-15T10:00:00');

    beforeEach(() => {
      Settings.now = () => fixedNow.toMillis();
    });

    afterEach(() => {
      Settings.now = () => Date.now();
    });

    it('should redirect past dates to today', () => {
      const decision = calculateRedirectDecision({
        wantedDay: DateTime.now().minus({ days: 2 }),
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.query.serviceDay).to.equal(
        fixedNow.startOf('day').toFormat(DATE_FORMAT),
      );
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect invalid dates to today', () => {
      const decision = calculateRedirectDecision({
        wantedDay: DateTime.fromISO('invalid-date-string'),
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.query.serviceDay).to.equal(
        fixedNow.startOf('day').toFormat(DATE_FORMAT),
      );
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect to route timetable when pattern code is missing', () => {
      const routeId = 'HSL:1001';
      const decision = calculateRedirectDecision({
        wantedDay: undefined,
        routeId,
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.query).to.deep.equal({});
      expect(decision.redirectPath).to.equal(
        routePagePath(routeId, PREFIX_TIMETABLE),
      );
    });

    it('should not redirect when conditions are valid', () => {
      const decision = calculateRedirectDecision({
        wantedDay: DateTime.now().plus({ days: 2 }),
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
      });

      expect(decision.shouldRedirect).to.equal(false);
      expect(decision.query).to.deep.equal({});
      expect(decision.redirectPath).to.equal(null);
    });

    it('should redirect to first available date when no trips found and wantedDay differs', () => {
      const firstAvailable = DateTime.now().plus({ days: 3 }).startOf('day');
      const secondAvailable = firstAvailable.plus({ days: 1 });

      const decision = calculateRedirectDecision({
        wantedDay: DateTime.now().plus({ days: 7 }),
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
        availableDates: [firstAvailable, secondAvailable],
        hasTrips: false,
      });

      expect(decision.shouldRedirect).to.equal(true);
      expect(decision.redirectPath).to.equal(null);
      expect(decision.query.serviceDay).to.equal(
        firstAvailable.toFormat(DATE_FORMAT),
      );
    });

    it('should not redirect when wantedDay already matches the first available date', () => {
      const firstAvailable = DateTime.now().plus({ days: 3 }).startOf('day');

      const decision = calculateRedirectDecision({
        wantedDay: firstAvailable,
        patternCode: 'HSL:1001:0:01',
        routeId: 'HSL:1001',
        availableDates: [firstAvailable],
        hasTrips: false,
      });

      expect(decision.shouldRedirect).to.equal(false);
    });

    it('should not redirect when patternCode is missing and routeId is also missing', () => {
      const decision = calculateRedirectDecision({
        wantedDay: DateTime.now().plus({ days: 1 }),
        patternCode: undefined,
        routeId: undefined,
      });

      expect(decision.shouldRedirect).to.equal(false);
    });
  });
});
