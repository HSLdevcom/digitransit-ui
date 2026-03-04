import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { DateTime } from 'luxon';

import { sortTrips, getTripsList } from '../../../app/util/scheduleTripsUtils';
import { DATE_FORMAT } from '../../../app/constants';

describe('scheduleTripsUtils', () => {
  describe('sortTrips', () => {
    it('should return null when trips is null', () => {
      const result = sortTrips(null);
      expect(result).to.equal(null);
    });

    it('should return null when trips is undefined', () => {
      const result = sortTrips(undefined);
      expect(result).to.equal(null);
    });

    it('should return empty array when trips is empty', () => {
      const result = sortTrips([]);
      expect(result).to.deep.equal([]);
    });

    it('should sort trips by first stoptime scheduledDeparture', () => {
      const trips = [
        {
          id: 'trip-3',
          stoptimes: [{ scheduledDeparture: 30000 }],
        },
        {
          id: 'trip-1',
          stoptimes: [{ scheduledDeparture: 10000 }],
        },
        {
          id: 'trip-2',
          stoptimes: [{ scheduledDeparture: 20000 }],
        },
      ];

      const result = sortTrips(trips);

      expect(result).to.have.lengthOf(3);
      expect(result[0].id).to.equal('trip-1');
      expect(result[1].id).to.equal('trip-2');
      expect(result[2].id).to.equal('trip-3');
    });

    it('should move trips without stoptimes to the end', () => {
      const trips = [
        {
          id: 'trip-1',
          stoptimes: [{ scheduledDeparture: 10000 }],
        },
        {
          id: 'trip-no-stoptimes',
          stoptimes: [],
        },
        {
          id: 'trip-2',
          stoptimes: [{ scheduledDeparture: 20000 }],
        },
      ];

      const result = sortTrips(trips);

      expect(result[0].id).to.equal('trip-1');
      expect(result[1].id).to.equal('trip-2');
      expect(result[2].id).to.equal('trip-no-stoptimes');
    });

    it('should move trips with undefined stoptimes to the end', () => {
      const trips = [
        {
          id: 'trip-1',
          stoptimes: [{ scheduledDeparture: 10000 }],
        },
        {
          id: 'trip-undefined-stoptimes',
          stoptimes: undefined,
        },
      ];

      const result = sortTrips(trips);

      expect(result[0].id).to.equal('trip-1');
      expect(result[1].id).to.equal('trip-undefined-stoptimes');
    });

    it('should preserve original array (not mutate)', () => {
      const trips = [
        {
          id: 'trip-3',
          stoptimes: [{ scheduledDeparture: 30000 }],
        },
        {
          id: 'trip-1',
          stoptimes: [{ scheduledDeparture: 10000 }],
        },
      ];

      const originalOrder = trips.map(t => t.id);
      sortTrips(trips);

      expect(trips.map(t => t.id)).to.deep.equal(originalOrder);
    });

    it('should handle trips with only undefined stoptimes', () => {
      const trips = [
        {
          id: 'trip-1',
          stoptimes: undefined,
        },
        {
          id: 'trip-2',
          stoptimes: undefined,
        },
      ];

      const result = sortTrips(trips);

      expect(result).to.have.lengthOf(2);
      expect(result[0].id).to.equal('trip-2');
      expect(result[1].id).to.equal('trip-1');
    });
  });

  describe('getTripsList', () => {
    let mockIntl;

    beforeEach(() => {
      mockIntl = {
        formatMessage: ({ id, defaultMessage }, values) => {
          if (id === 'no-trips-found') {
            return `No journeys found for the selected date ${
              values?.selectedDate || ''
            }`;
          }
          return defaultMessage;
        },
      };
    });

    it('should return message when no trips are found', () => {
      const pattern = {
        code: 'HSL:1001:0:01',
        trips: [],
      };
      const wantedDay = DateTime.fromFormat('20240116', DATE_FORMAT);

      const result = getTripsList({
        patternWithTrips: pattern,
        wantedDay,
        intl: mockIntl,
      });

      expect(result.trips).to.equal(null);
      expect(result.noTripsMessage).to.not.equal(null);
      expect(result.noTripsMessage.props.children).to.include('16.1.2024');
    });

    it('should return sorted trips when trips are available', () => {
      const pattern = {
        code: 'HSL:1001:0:01',
        trips: [
          {
            id: 'trip-2',
            stoptimes: [{ scheduledDeparture: 20000 }],
          },
          {
            id: 'trip-1',
            stoptimes: [{ scheduledDeparture: 10000 }],
          },
        ],
      };

      const result = getTripsList({
        patternWithTrips: pattern,
        intl: mockIntl,
      });

      expect(result.trips).to.have.lengthOf(2);
      expect(result.trips[0].id).to.equal('trip-1');
      expect(result.trips[1].id).to.equal('trip-2');
      expect(result.noTripsMessage).to.equal(null);
    });

    it('should return null for pattern when pattern is null', () => {
      const result = getTripsList({
        patternWithTrips: null,
        intl: mockIntl,
      });

      expect(result.trips).to.equal(null);
    });

    it('should return null for pattern when pattern is undefined', () => {
      const result = getTripsList({
        patternWithTrips: undefined,
        intl: mockIntl,
      });

      expect(result.trips).to.equal(null);
    });

    it('should include formatted date in message when no trips found', () => {
      const pattern = {
        code: 'HSL:1001:0:01',
        trips: [],
      };
      const wantedDay = DateTime.fromFormat('20240115', DATE_FORMAT);

      const result = getTripsList({
        patternWithTrips: pattern,
        intl: mockIntl,
        wantedDay,
      });

      expect(result.noTripsMessage).to.not.equal(null);
      expect(result.noTripsMessage.props.children).to.include('15.1.2024');
    });

    it('should handle pattern without trips property', () => {
      const pattern = {
        code: 'HSL:1001:0:01',
      };

      const result = getTripsList({
        patternWithTrips: pattern,
        intl: mockIntl,
      });

      expect(result.trips).to.equal(null);
      expect(result.noTripsMessage).to.not.equal(null);
      expect(result.noTripsMessage.props.role).to.equal('alert');
    });

    describe('Edge cases', () => {
      it('should handle null trips in pattern', () => {
        const pattern = {
          code: 'HSL:1001:0:01',
          trips: null,
        };

        const result = getTripsList({
          patternWithTrips: pattern,
          intl: mockIntl,
        });

        expect(result.trips).to.equal(null);
      });

      it('should handle trips with mixed valid and invalid stoptimes', () => {
        const pattern = {
          code: 'HSL:1001:0:01',
          trips: [
            {
              id: 'trip-valid',
              stoptimes: [{ scheduledDeparture: 10000 }],
            },
            {
              id: 'trip-empty',
              stoptimes: [],
            },
            {
              id: 'trip-another-valid',
              stoptimes: [{ scheduledDeparture: 20000 }],
            },
          ],
        };

        const result = getTripsList({
          patternWithTrips: pattern,
          intl: mockIntl,
        });

        expect(result.trips).to.have.lengthOf(3);
        expect(result.trips[0].id).to.equal('trip-valid');
        expect(result.trips[1].id).to.equal('trip-another-valid');
        expect(result.trips[2].id).to.equal('trip-empty');
      });

      it('should handle undefined wantedDay', () => {
        const pattern = {
          code: 'HSL:1001:0:01',
          trips: [],
        };

        const result = getTripsList({
          patternWithTrips: pattern,
          intl: mockIntl,
          wantedDay: undefined,
        });

        expect(result.trips).to.equal(null);
        expect(result.noTripsMessage).to.not.equal(null);
        expect(result.noTripsMessage.props.className).to.equal(
          'no-trips-message',
        );
      });

      it('should return object with both trips and noTripsMessage properties', () => {
        const pattern = {
          code: 'HSL:1001:0:01',
          trips: [
            {
              id: 'trip-1',
              stoptimes: [{ scheduledDeparture: 10000 }],
            },
          ],
        };

        const result = getTripsList({
          patternWithTrips: pattern,
          intl: mockIntl,
        });

        expect(result).to.have.property('trips');
        expect(result).to.have.property('noTripsMessage');
      });
    });
  });
});
