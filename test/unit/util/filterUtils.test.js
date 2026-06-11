import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import { filterAndSortAlerts } from '../../../app/component/trafficnow/filters/filterUtils';

/**
 * All individual filter functions are tested indirectly through
 * filterAndSortAlerts. To isolate each filter, we construct alerts and
 * selectedFilters that pass all other filters so only the filter under test
 * determines the outcome.
 *
 * Timestamp conventions used throughout:
 *   nowMs  = 1_000_000 ms  (1000 seconds)
 *   nowSec = 1000 seconds
 *
 * pastFilter        uses selectedFilters.now (milliseconds)
 * validityPeriodFilter uses Date.now() * 0.001 (seconds) internally
 */

describe('filterAndSortAlerts', () => {
  const nowMs = 1_000_000;
  const nowSec = 1000;

  /**
   * Returns an alert that passes ALL default filters with baseFilters below.
   */
  const makeAlert = (overrides = {}) => ({
    id: 'alert-1',
    effectiveEndDate: 2000, // seconds; 2000 * 1000 = 2_000_000 ms > nowMs (passes pastFilter)
    alertEffect: 'DELAY', // !== 'NO_EFFECT' (passes noEffectFilter)
    effectiveStartDate: 500, // seconds; in the past relative to nowSec (passes VALID/ALL/UPCOMING-exclusion tests)
    entities: [], // empty (passes vehicleModesFilter, entityFilter, favouriteFilter)
    __typename: 'Alert',
    ...overrides,
  });

  /**
   * The most permissive set of selectedFilters — every alert passes every
   * filter unless the test deliberately breaks one.
   */
  const baseFilters = {
    now: nowMs,
    noEffect: 'NO_EFFECT',
    validityPeriod: 'ALL',
    vehicleModes: [],
  };

  describe('pastFilter', () => {
    it('filters out alerts whose effectiveEndDate has already passed', () => {
      const expiredAlert = makeAlert({ effectiveEndDate: 999 });
      const result = filterAndSortAlerts([expiredAlert], baseFilters);
      expect(result).to.have.lengthOf(0);
    });

    it('keeps alerts that have not yet expired', () => {
      const validAlert = makeAlert({ effectiveEndDate: 2000 });
      const result = filterAndSortAlerts([validAlert], baseFilters);
      expect(result).to.have.lengthOf(1);
    });
  });

  describe('noEffectFilter', () => {
    it('filters out alerts whose alertEffect equals the noEffect filter value', () => {
      const noEffectAlert = makeAlert({ alertEffect: 'NO_EFFECT' });
      const result = filterAndSortAlerts([noEffectAlert], baseFilters);
      expect(result).to.have.lengthOf(0);
    });

    it('keeps alerts with a different alertEffect', () => {
      const delayAlert = makeAlert({ alertEffect: 'DELAY' });
      const result = filterAndSortAlerts([delayAlert], baseFilters);
      expect(result).to.have.lengthOf(1);
    });
  });

  describe('validityPeriodFilter', () => {
    let dateNowStub;

    beforeEach(() => {
      // validityPeriodFilter uses Date.now() * 0.001 internally
      dateNowStub = sinon.stub(Date, 'now').returns(nowMs);
    });

    afterEach(() => {
      dateNowStub.restore();
    });

    it("'ALL' always passes alerts regardless of dates", () => {
      const alert = makeAlert({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        validityPeriod: 'ALL',
      });
      expect(result).to.have.lengthOf(1);
    });

    it("'VALID' keeps alerts where now is within the start-end range", () => {
      const alert = makeAlert({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        validityPeriod: 'VALID',
      });
      expect(result).to.have.lengthOf(1);
    });

    it("'VALID' excludes alerts that have not started yet", () => {
      const futureAlert = makeAlert({
        effectiveStartDate: 2000,
        effectiveEndDate: 5000,
      });
      const result = filterAndSortAlerts([futureAlert], {
        ...baseFilters,
        validityPeriod: 'VALID',
      });
      expect(result).to.have.lengthOf(0);
    });

    it("'VALID' keeps an alert whose range starts exactly at now (inclusive lower bound)", () => {
      const startsNow = makeAlert({
        effectiveStartDate: nowSec,
        effectiveEndDate: 2000,
      });
      const result = filterAndSortAlerts([startsNow], {
        ...baseFilters,
        validityPeriod: 'VALID',
      });
      expect(result).to.have.lengthOf(1);
    });

    it("'UPCOMING' keeps alerts whose start date is in the future", () => {
      const upcomingAlert = makeAlert({
        effectiveStartDate: 2000,
        effectiveEndDate: 5000,
      });
      const result = filterAndSortAlerts([upcomingAlert], {
        ...baseFilters,
        validityPeriod: 'UPCOMING',
      });
      expect(result).to.have.lengthOf(1);
    });

    it("'UPCOMING' excludes alerts that have already started", () => {
      const startedAlert = makeAlert({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      const result = filterAndSortAlerts([startedAlert], {
        ...baseFilters,
        validityPeriod: 'UPCOMING',
      });
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('vehicleModesFilter', () => {
    it('passes all alerts when vehicleModes is empty', () => {
      const alert = makeAlert({ entities: [{ vehicleMode: 'BUS' }] });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        vehicleModes: [],
      });
      expect(result).to.have.lengthOf(1);
    });

    it('matches Stop entities via vehicleMode property', () => {
      const alert = makeAlert({
        entities: [{ vehicleMode: 'BUS' }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        vehicleModes: ['BUS'],
      });
      expect(result).to.have.lengthOf(1);
    });

    it('matches Route entities via mode property', () => {
      const alert = makeAlert({
        entities: [{ mode: 'RAIL' }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        vehicleModes: ['RAIL'],
      });
      expect(result).to.have.lengthOf(1);
    });

    it('matches StopOnRoute entities via route.mode property', () => {
      const alert = makeAlert({
        entities: [{ route: { mode: 'TRAM' } }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        vehicleModes: ['TRAM'],
      });
      expect(result).to.have.lengthOf(1);
    });

    it('rejects alerts when no entity matches the selected modes', () => {
      const alert = makeAlert({
        entities: [{ vehicleMode: 'BUS' }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        vehicleModes: ['RAIL'],
      });
      expect(result).to.have.lengthOf(0);
    });

    it('is case-insensitive when matching vehicle modes', () => {
      const alert = makeAlert({
        entities: [{ vehicleMode: 'BUS' }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        vehicleModes: ['bus'],
      });
      expect(result).to.have.lengthOf(1);
    });
  });

  describe('entityFilter', () => {
    it('passes all alerts when no entity filter is set', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:1' }] });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        entity: undefined,
      });
      expect(result).to.have.lengthOf(1);
    });

    it('keeps an alert when one of its entities matches the filter gtfsId', () => {
      const alert = makeAlert({
        entities: [{ gtfsId: 'HSL:1' }, { gtfsId: 'HSL:2' }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        entity: { gtfsId: 'HSL:1' },
      });
      expect(result).to.have.lengthOf(1);
    });

    it('rejects an alert when no entity matches the filter gtfsId', () => {
      const alert = makeAlert({
        entities: [{ gtfsId: 'HSL:1' }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        entity: { gtfsId: 'HSL:99' },
      });
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('favouriteFilter', () => {
    it('passes all alerts when no favourites filter is set', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:1' }] });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        favourites: undefined,
      });
      expect(result).to.have.lengthOf(1);
    });

    it('keeps alerts when at least one entity gtfsId is in the favourites Set', () => {
      const alert = makeAlert({
        entities: [{ gtfsId: 'HSL:1' }, { gtfsId: 'HSL:2' }],
      });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        favourites: new Set(['HSL:2', 'HSL:3']),
      });
      expect(result).to.have.lengthOf(1);
    });

    it('rejects alerts when no entity gtfsId is in the favourites Set', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:1' }] });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        favourites: new Set(['HSL:99']),
      });
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('cancellationsFilter', () => {
    it('passes all alerts when cancellations filter is falsy', () => {
      const alert = makeAlert({ __typename: 'Alert' });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        cancellations: false,
      });
      expect(result).to.have.lengthOf(1);
    });

    it("filters out '__typename: Alert' items when cancellations=true", () => {
      const alert = makeAlert({ __typename: 'Alert' });
      const result = filterAndSortAlerts([alert], {
        ...baseFilters,
        cancellations: true,
      });
      expect(result).to.have.lengthOf(0);
    });

    it('keeps non-Alert items (e.g. cancelled trips) when cancellations=true', () => {
      const canceledTrip = makeAlert({ __typename: 'CancelledTrip' });
      const result = filterAndSortAlerts([canceledTrip], {
        ...baseFilters,
        cancellations: true,
      });
      expect(result).to.have.lengthOf(1);
    });
  });

  describe('sorting and combined behaviour', () => {
    it('sorts results by effectiveStartDate ascending', () => {
      const alertA = makeAlert({ id: 'a', effectiveStartDate: 800 });
      const alertB = makeAlert({ id: 'b', effectiveStartDate: 300 });
      const alertC = makeAlert({ id: 'c', effectiveStartDate: 600 });

      const result = filterAndSortAlerts([alertA, alertB, alertC], baseFilters);
      expect(result.map(a => a.id)).to.deep.equal(['b', 'c', 'a']);
    });

    it('returns an empty array when no alerts pass all filters', () => {
      const expiredAlert = makeAlert({ effectiveEndDate: 500 }); // fails pastFilter
      const noEffectAlert = makeAlert({ alertEffect: 'NO_EFFECT' }); // fails noEffectFilter
      const result = filterAndSortAlerts(
        [expiredAlert, noEffectAlert],
        baseFilters,
      );
      expect(result).to.have.lengthOf(0);
    });

    it('applies multiple filters in combination, keeping only fully-passing alerts', () => {
      const passing = makeAlert({
        id: 'pass',
        alertEffect: 'DELAY',
        effectiveEndDate: 2000,
      });
      const failsNoEffect = makeAlert({ id: 'fail', alertEffect: 'NO_EFFECT' });

      const result = filterAndSortAlerts([passing, failsNoEffect], baseFilters);
      expect(result).to.have.lengthOf(1);
      expect(result[0].id).to.equal('pass');
    });
  });
});
