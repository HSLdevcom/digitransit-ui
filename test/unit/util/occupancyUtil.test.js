import { expect } from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import {
  mapStatus,
  capacityToTranslationId,
  isDepartureWithinWindow,
  getCapacity,
  getCapacityForLeg,
} from '../../../app/util/occupancyUtil';

const NOW = 1_700_000_000_000;
const minutesFromNow = minutes => NOW + minutes * 60 * 1000;

describe('occupancyUtil', () => {
  describe('mapStatus', () => {
    it('should map EMPTY to MANY_SEATS_AVAILABLE', () => {
      expect(mapStatus('EMPTY')).to.equal('MANY_SEATS_AVAILABLE');
    });

    it('should map NOT_ACCEPTING_PASSENGERS to CRUSHED_STANDING_ROOM_ONLY', () => {
      expect(mapStatus('NOT_ACCEPTING_PASSENGERS')).to.equal(
        'CRUSHED_STANDING_ROOM_ONLY',
      );
    });

    it('should map FULL to CRUSHED_STANDING_ROOM_ONLY', () => {
      expect(mapStatus('FULL')).to.equal('CRUSHED_STANDING_ROOM_ONLY');
    });

    it('should pass through MANY_SEATS_AVAILABLE', () => {
      expect(mapStatus('MANY_SEATS_AVAILABLE')).to.equal(
        'MANY_SEATS_AVAILABLE',
      );
    });

    it('should pass through FEW_SEATS_AVAILABLE', () => {
      expect(mapStatus('FEW_SEATS_AVAILABLE')).to.equal('FEW_SEATS_AVAILABLE');
    });

    it('should pass through STANDING_ROOM_ONLY', () => {
      expect(mapStatus('STANDING_ROOM_ONLY')).to.equal('STANDING_ROOM_ONLY');
    });

    it('should return NO_DATA_AVAILABLE for unknown status', () => {
      expect(mapStatus('SOMETHING_ELSE')).to.equal('NO_DATA_AVAILABLE');
      expect(mapStatus(undefined)).to.equal('NO_DATA_AVAILABLE');
    });
  });

  describe('capacityToTranslationId', () => {
    it('should map EMPTY and MANY_SEATS_AVAILABLE to many-seats heading', () => {
      expect(capacityToTranslationId('EMPTY')).to.equal(
        'capacity-modal.many-seats-available-heading',
      );
      expect(capacityToTranslationId('MANY_SEATS_AVAILABLE')).to.equal(
        'capacity-modal.many-seats-available-heading',
      );
    });

    it('should map STANDING_ROOM_ONLY to standing-room heading', () => {
      expect(capacityToTranslationId('STANDING_ROOM_ONLY')).to.equal(
        'capacity-modal.standing-room-only-heading',
      );
    });

    it('should map CRUSHED_STANDING_ROOM_ONLY to crushed-standing-room heading', () => {
      expect(capacityToTranslationId('CRUSHED_STANDING_ROOM_ONLY')).to.equal(
        'capacity-modal.crushed-standing-room-only-heading',
      );
    });

    it('should map NOT_ACCEPTING_PASSENGERS and FULL to full-capacity heading', () => {
      expect(capacityToTranslationId('NOT_ACCEPTING_PASSENGERS')).to.equal(
        'capacity-modal.full-capacity-heading',
      );
      expect(capacityToTranslationId('FULL')).to.equal(
        'capacity-modal.full-capacity-heading',
      );
    });

    it('should default to few-seats heading', () => {
      expect(capacityToTranslationId('FEW_SEATS_AVAILABLE')).to.equal(
        'capacity-modal.few-seats-available-heading',
      );
      expect(capacityToTranslationId('UNKNOWN')).to.equal(
        'capacity-modal.few-seats-available-heading',
      );
    });
  });

  describe('isDepartureWithinWindow', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers(NOW);
    });

    afterEach(() => {
      clock.restore();
    });

    it('should return true for a departure 14 minutes from now within a 15 minute window', () => {
      expect(isDepartureWithinWindow(minutesFromNow(14), 15)).to.equal(true);
    });

    it('should return true just under the window boundary', () => {
      expect(isDepartureWithinWindow(minutesFromNow(15) - 1000, 15)).to.equal(
        true,
      );
    });

    it('should return false exactly at the window boundary', () => {
      expect(isDepartureWithinWindow(minutesFromNow(15), 15)).to.equal(false);
    });

    it('should return false for a departure beyond the window', () => {
      expect(isDepartureWithinWindow(minutesFromNow(16), 15)).to.equal(false);
    });

    it('should respect a custom (smaller) window', () => {
      expect(isDepartureWithinWindow(minutesFromNow(12), 10)).to.equal(false);
      expect(isDepartureWithinWindow(minutesFromNow(8), 10)).to.equal(true);
    });

    it('should return false for a departure in the past', () => {
      expect(isDepartureWithinWindow(minutesFromNow(-1), 15)).to.equal(false);
    });

    it('should return false for a departure exactly now', () => {
      expect(isDepartureWithinWindow(NOW, 15)).to.equal(false);
    });
  });

  describe('getCapacity', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers(NOW);
    });

    afterEach(() => {
      clock.restore();
    });

    const config = {
      useRealtimeTravellerCapacities: true,
      realtimeTravellerCapacityWindowMinutes: 15,
    };

    it('should return mapped status when all conditions are met', () => {
      expect(
        getCapacity(config, 'FEW_SEATS_AVAILABLE', minutesFromNow(5)),
      ).to.equal('FEW_SEATS_AVAILABLE');
    });

    it('should return mapped status for departures up to the configured window', () => {
      expect(
        getCapacity(config, 'MANY_SEATS_AVAILABLE', minutesFromNow(14)),
      ).to.equal('MANY_SEATS_AVAILABLE');
    });

    it('should respect a custom window from config', () => {
      const config10 = {
        useRealtimeTravellerCapacities: true,
        realtimeTravellerCapacityWindowMinutes: 10,
      };
      expect(
        getCapacity(config10, 'FEW_SEATS_AVAILABLE', minutesFromNow(12)),
      ).to.equal(null);
      expect(
        getCapacity(config10, 'FEW_SEATS_AVAILABLE', minutesFromNow(8)),
      ).to.equal('FEW_SEATS_AVAILABLE');
    });

    it('should return null when config flag is disabled', () => {
      expect(
        getCapacity(
          {
            useRealtimeTravellerCapacities: false,
            realtimeTravellerCapacityWindowMinutes: 15,
          },
          'FEW_SEATS_AVAILABLE',
          minutesFromNow(5),
        ),
      ).to.equal(null);
    });

    it('should return null when occupancyStatus is missing', () => {
      expect(getCapacity(config, undefined, minutesFromNow(5))).to.equal(null);
    });

    it('should return null when occupancyStatus is NO_DATA_AVAILABLE', () => {
      expect(
        getCapacity(config, 'NO_DATA_AVAILABLE', minutesFromNow(5)),
      ).to.equal(null);
    });

    it('should return null when departure is beyond the configured window', () => {
      expect(
        getCapacity(config, 'FEW_SEATS_AVAILABLE', minutesFromNow(16)),
      ).to.equal(null);
    });

    it('should return null when departure is in the past', () => {
      expect(
        getCapacity(config, 'FEW_SEATS_AVAILABLE', minutesFromNow(-5)),
      ).to.equal(null);
    });
  });

  describe('getCapacityForLeg', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers(NOW);
    });

    afterEach(() => {
      clock.restore();
    });

    const config = {
      useRealtimeTravellerCapacities: true,
      realtimeTravellerCapacityWindowMinutes: 15,
    };

    it('should resolve capacity from the leg trip occupancy', () => {
      const leg = {
        start: { scheduledTime: new Date(minutesFromNow(5)).toISOString() },
        trip: { occupancy: { occupancyStatus: 'FEW_SEATS_AVAILABLE' } },
      };
      expect(getCapacityForLeg(config, leg)).to.equal('FEW_SEATS_AVAILABLE');
    });

    it('should return null when the leg has no occupancy data', () => {
      const leg = {
        start: { scheduledTime: new Date(minutesFromNow(5)).toISOString() },
        trip: {},
      };
      expect(getCapacityForLeg(config, leg)).to.equal(null);
    });
  });
});
