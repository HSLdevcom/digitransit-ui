import { isStoredItineraryRelevant } from '../../../../app/component/itinerary/ItineraryPageUtils';

describe('itineraryPageUtils', () => {
  describe('isStoredItineraryRelevant', () => {
    const TIME = 12345;
    const ARRIVE_BY = false;
    const INDEX = '0';
    const TEN_MINUTES_FROM_NOW = new Date(Date.now() + 600000).toISOString();

    let mockStoredItinerary;
    let mockMatch;

    beforeEach(() => {
      mockStoredItinerary = {
        itinerary: {
          end: TEN_MINUTES_FROM_NOW,
        },
        params: {
          from: 'foo',
          to: 'bar',
          arriveBy: ARRIVE_BY,
          time: TIME,
          hash: INDEX,
          secondHash: undefined,
          queryTime: TIME,
        },
      };

      mockMatch = {
        params: { from: 'foo', to: 'bar', hash: INDEX, secondHash: undefined },
        location: { query: { time: TIME, arriveBy: ARRIVE_BY } },
      };
    });

    it('should return true for equal params', () => {
      expect(isStoredItineraryRelevant(mockStoredItinerary, mockMatch)).toBe(
        true,
      );
    });

    it('should return true if stored index matches secondHash', () => {
      expect(
        isStoredItineraryRelevant(mockStoredItinerary, {
          ...mockMatch,
          hash: 'other',
          secondHash: INDEX,
        }),
      ).toBe(true);
    });

    it('should return true if arriveBy is undefined for both', () => {
      const itineraryWithoutArriveBy = { ...mockStoredItinerary };
      const matchWithoutArriveBy = { ...mockMatch };
      itineraryWithoutArriveBy.params.arriveBy = undefined;
      matchWithoutArriveBy.location.query.arriveBy = undefined;

      expect(
        isStoredItineraryRelevant(
          itineraryWithoutArriveBy,
          matchWithoutArriveBy,
        ),
      ).toBe(true);
    });

    it('should return false for past itinerary', () => {
      const TEN_MINUTES_IN_THE_PAST = new Date(
        Date.now() + 600000,
      ).toISOString();

      expect(
        isStoredItineraryRelevant(
          {
            ...mockStoredItinerary,
            itinerary: { end: TEN_MINUTES_IN_THE_PAST },
          },
          mockMatch,
        ),
      ).toBe(true);
    });

    it('should return false on index and hash mismatch if secondHash is undefined', () => {
      const matchWithDifferentHash = { ...mockMatch };
      matchWithDifferentHash.params.hash = '999';
      matchWithDifferentHash.params.secondHash = undefined;

      expect(
        isStoredItineraryRelevant(mockStoredItinerary, matchWithDifferentHash),
      ).toBe(false);
    });

    it('should return false on index and hash mismatch if hash and secondHash are undefined', () => {
      const matchWithDifferentHash = { ...mockMatch };
      matchWithDifferentHash.params.hash = undefined;
      matchWithDifferentHash.params.secondHash = undefined;

      expect(
        isStoredItineraryRelevant(mockStoredItinerary, matchWithDifferentHash),
      ).toBe(false);
    });

    it('should throw error if match is undefined', () => {
      expect(() =>
        isStoredItineraryRelevant(mockStoredItinerary, undefined),
      ).toThrow(Error);
    });

    it('should not throw error if stored itinerary is empty object', () => {
      expect(() => isStoredItineraryRelevant({}, mockMatch)).not.toThrow(Error);
      expect(isStoredItineraryRelevant({}, mockMatch)).toBe(false);
    });

    it('should not throw error if stored itinerary is missing itinerary field', () => {
      expect(() =>
        isStoredItineraryRelevant(
          { ...mockStoredItinerary, itinerary: undefined },
          mockMatch,
        ),
      ).not.toThrow(Error);
      expect(
        isStoredItineraryRelevant(
          { ...mockStoredItinerary, itinerary: undefined },
          mockMatch,
        ),
      ).toBe(false);
    });

    it('should not throw error if stored itinerary is missing itinerary field', () => {
      expect(() =>
        isStoredItineraryRelevant(
          { ...mockStoredItinerary, params: undefined },
          mockMatch,
        ),
      ).not.toThrow(Error);
      expect(
        isStoredItineraryRelevant(
          { ...mockStoredItinerary, params: undefined },
          mockMatch,
        ),
      ).toBe(false);
    });
  });
});
