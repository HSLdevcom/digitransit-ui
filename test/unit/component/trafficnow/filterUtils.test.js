import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import { filterAndSortAlerts } from '../../../../app/component/trafficnow/filters/filterUtils';

const NOW_MS = 1_000_000;

const makeAlert = (overrides = {}) => ({
  __typename: 'Alert',
  alertEffect: 'DELAY',
  entities: [{ gtfsId: 'HSL:1', vehicleMode: 'BUS' }],
  effectiveStartDate: 500, // seconds — before now (1000 s)
  effectiveEndDate: 2000, // seconds — after now (1000 s)
  ...overrides,
});

// Base filters: no filtering beyond the mandatory pastFilter/noEffectFilter.
const defaultFilters = {
  now: NOW_MS,
  noEffect: 'NO_EFFECT',
  validityPeriod: 'ALL',
  vehicleModes: [],
};

describe('filterAndSortAlerts', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(Date, 'now').returns(NOW_MS);
  });

  afterEach(() => sandbox.restore());

  describe('pastFilter — removes alerts whose end time has passed', () => {
    it('includes an alert when selectedFilters.now < effectiveEndDate * 1000', () => {
      const alert = makeAlert({ effectiveEndDate: 2000 }); // 2_000_000 ms
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        now: 1_000_000,
      });
      expect(result).to.include(alert);
    });

    it('excludes an alert when selectedFilters.now >= effectiveEndDate * 1000', () => {
      const alert = makeAlert({ effectiveEndDate: 500 }); // 500_000 ms
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        now: 1_000_000,
      });
      expect(result).to.not.include(alert);
    });
  });

  describe('noEffectFilter — removes alerts with the designated no-effect alertEffect', () => {
    it('excludes an alert whose alertEffect equals noEffect', () => {
      const alert = makeAlert({ alertEffect: 'NO_EFFECT' });
      const result = filterAndSortAlerts([alert], defaultFilters);
      expect(result).to.have.length(0);
    });

    it('includes an alert whose alertEffect differs from noEffect', () => {
      const alert = makeAlert({ alertEffect: 'DELAY' });
      const result = filterAndSortAlerts([alert], defaultFilters);
      expect(result).to.include(alert);
    });
  });

  describe('validityPeriodFilter', () => {
    it('includes all alerts when validityPeriod is ALL', () => {
      const alert = makeAlert({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        validityPeriod: 'ALL',
      });
      expect(result).to.include(alert);
    });

    it('includes an active alert when validityPeriod is VALID', () => {
      const alert = makeAlert({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        validityPeriod: 'VALID',
      });
      expect(result).to.include(alert);
    });

    it('excludes a future alert when validityPeriod is VALID', () => {
      const alert = makeAlert({
        effectiveStartDate: 2000,
        effectiveEndDate: 5000,
      });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        validityPeriod: 'VALID',
      });
      expect(result).to.have.length(0);
    });

    it('excludes an already-ended alert when validityPeriod is VALID', () => {
      const alert = makeAlert({
        effectiveStartDate: 100,
        effectiveEndDate: 500,
      });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        now: 100,
        validityPeriod: 'VALID',
      });
      expect(result).to.have.length(0);
    });

    it('includes a future alert when validityPeriod is UPCOMING', () => {
      const alert = makeAlert({
        effectiveStartDate: 2000,
        effectiveEndDate: 5000,
      });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        validityPeriod: 'UPCOMING',
      });
      expect(result).to.include(alert);
    });

    it('excludes an active alert when validityPeriod is UPCOMING', () => {
      const alert = makeAlert({
        effectiveStartDate: 500,
        effectiveEndDate: 2000,
      });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        validityPeriod: 'UPCOMING',
      });
      expect(result).to.have.length(0);
    });

    it('excludes an alert with no effectiveStartDate when validityPeriod is UPCOMING', () => {
      const alert = makeAlert({ effectiveStartDate: 0 });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        validityPeriod: 'UPCOMING',
      });
      expect(result).to.have.length(0);
    });
  });

  describe('vehicleModesFilter', () => {
    it('includes all alerts when vehicleModes is empty', () => {
      const alert = makeAlert({ entities: [{ vehicleMode: 'BUS' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        vehicleModes: [],
      });
      expect(result).to.include(alert);
    });

    it('includes an alert when a Stop entity vehicleMode matches a selected mode', () => {
      const alert = makeAlert({ entities: [{ vehicleMode: 'BUS' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        vehicleModes: ['BUS'],
      });
      expect(result).to.include(alert);
    });

    it('includes an alert when a Route entity mode matches a selected mode', () => {
      const alert = makeAlert({ entities: [{ mode: 'TRAM' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        vehicleModes: ['TRAM'],
      });
      expect(result).to.include(alert);
    });

    it('includes an alert when a StopOnRoute entity route.mode matches a selected mode', () => {
      const alert = makeAlert({ entities: [{ route: { mode: 'RAIL' } }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        vehicleModes: ['RAIL'],
      });
      expect(result).to.include(alert);
    });

    it('excludes an alert when no entity matches any of the selected modes', () => {
      const alert = makeAlert({ entities: [{ vehicleMode: 'BUS' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        vehicleModes: ['TRAM'],
      });
      expect(result).to.have.length(0);
    });

    it('is case-insensitive when comparing modes', () => {
      const alert = makeAlert({ entities: [{ vehicleMode: 'bus' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        vehicleModes: ['BUS'],
      });
      expect(result).to.include(alert);
    });
  });

  describe('entityFilter', () => {
    it('includes all alerts when no entity filter is set', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:1' }] });
      const result = filterAndSortAlerts([alert], defaultFilters);
      expect(result).to.include(alert);
    });

    it('includes an alert when one of its entities matches the filter entity gtfsId', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:1' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        entity: { gtfsId: 'HSL:1' },
      });
      expect(result).to.include(alert);
    });

    it('excludes an alert when none of its entities match the filter entity gtfsId', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:2' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        entity: { gtfsId: 'HSL:1' },
      });
      expect(result).to.have.length(0);
    });
  });

  describe('favouriteFilter', () => {
    it('includes all alerts when no favourites filter is set', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:1' }] });
      const result = filterAndSortAlerts([alert], defaultFilters);
      expect(result).to.include(alert);
    });

    it('includes an alert when an entity gtfsId is in the favourites Set', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:1' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        favourites: new Set(['HSL:1']),
      });
      expect(result).to.include(alert);
    });

    it('excludes an alert when no entity gtfsId is in the favourites Set', () => {
      const alert = makeAlert({ entities: [{ gtfsId: 'HSL:2' }] });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        favourites: new Set(['HSL:1']),
      });
      expect(result).to.have.length(0);
    });
  });

  describe('cancellationsFilter', () => {
    it('includes non-Alert items when the cancellations filter is set', () => {
      const item = makeAlert({ __typename: 'CanceledTrip' });
      const result = filterAndSortAlerts([item], {
        ...defaultFilters,
        cancellations: true,
      });
      expect(result).to.include(item);
    });

    it('excludes Alert type items when the cancellations filter is set', () => {
      const alert = makeAlert({ __typename: 'Alert' });
      const result = filterAndSortAlerts([alert], {
        ...defaultFilters,
        cancellations: true,
      });
      expect(result).to.have.length(0);
    });

    it('includes Alert type items when the cancellations filter is not set', () => {
      const alert = makeAlert({ __typename: 'Alert' });
      const result = filterAndSortAlerts([alert], defaultFilters);
      expect(result).to.include(alert);
    });
  });

  describe('Sorting', () => {
    it('sorts results by effectiveStartDate ascending', () => {
      const a1 = makeAlert({ effectiveStartDate: 800 });
      const a2 = makeAlert({ effectiveStartDate: 300 });
      const a3 = makeAlert({ effectiveStartDate: 600 });
      const result = filterAndSortAlerts([a1, a2, a3], defaultFilters);
      expect(result.map(a => a.effectiveStartDate)).to.deep.equal([
        300, 600, 800,
      ]);
    });
  });
});
