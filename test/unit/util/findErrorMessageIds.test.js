import { expect } from 'chai';
import { describe, it } from 'mocha';
import findErrorMessageIds from '../../../app/component/ItinerarySummaryListContainer/components/utils/findErrorMessageIds';

const expectSingleValue = (arr, expected) => {
  expect(arr.length).to.equal(1);
  expect(arr[0]).to.equal(expected);
};

const expectToContain = (arr, expected) => {
  expect(arr.indexOf(expected) >= 0).to.equal(true);
};

describe('findErrorMessageIds', () => {
  describe('routerErrors', () => {
    it('should return no-transit-connection', async () => {
      const msgIds = findErrorMessageIds([
        { code: 'NO_TRANSIT_CONNECTION', inputField: null },
      ]);
      expectSingleValue(msgIds, 'no-transit-connection');
    });

    it('should return no-transit-connection-in-search-window', async () => {
      const msgIds = findErrorMessageIds([
        { code: 'NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW', inputField: null },
      ]);
      expectSingleValue(msgIds, 'no-transit-connection-in-search-window');
    });

    it('should return outside-bounds-1', async () => {
      const msgIds = findErrorMessageIds([
        { code: 'OUTSIDE_BOUNDS', inputField: 'TO' },
      ]);
      expectSingleValue(msgIds, 'outside-bounds-1');
    });

    it('should return outside-bounds-2', async () => {
      const msgIds = findErrorMessageIds([
        { code: 'OUTSIDE_BOUNDS', inputField: 'FROM' },
      ]);
      expectSingleValue(msgIds, 'outside-bounds-2');
    });

    it('should return outside-bounds-3', async () => {
      const msgIds = findErrorMessageIds([
        { code: 'OUTSIDE_BOUNDS', inputField: 'FROM' },
        { code: 'OUTSIDE_BOUNDS', inputField: 'TO' },
      ]);
      expectSingleValue(msgIds, 'outside-bounds-3');
    });

    it('should return multiple message ids', () => {
      const msgIds = findErrorMessageIds([
        { code: 'OUTSIDE_BOUNDS', inputField: 'FROM' },
        { code: 'NO_STOPS_IN_RANGE', inputField: 'TO' },
      ]);

      expect(msgIds.length).to.equal(2);
      expectToContain(msgIds, 'outside-bounds-2');
      expectToContain(msgIds, 'no-stops-in-range-1');
    });
  });

  describe('queryErrors', () => {
    it('should return no-route-already-at-destination', () => {
      const msgIds1 = findErrorMessageIds(
        [],
        {
          from: { lat: 60, lon: 25 },
          to: { lat: 60.00001, lon: 25.00001 },
        },
        {
          minDistanceBetweenFromAndTo: 10.0,
          locationState: {
            hasLocation: true,
            lat: 60,
            lon: 25,
          },
        },
      );
      expectSingleValue(msgIds1, 'no-route-already-at-destination');

      const msgIds2 = findErrorMessageIds(
        [],
        {
          from: { lat: 60, lon: 25 },
          to: { lat: 60.00001, lon: 25.00001 },
        },
        {
          minDistanceBetweenFromAndTo: 10.0,
          locationState: {
            hasLocation: true,
            lat: 65,
            lon: 30,
          },
        },
      );
      expect(msgIds2.length).to.equal(0);
    });

    it('should return no-route-origin-same-as-destination', () => {
      const msgIds = findErrorMessageIds(
        [],
        {
          from: { lat: 60, lon: 25 },
          to: { lat: 60, lon: 25 },
        },
        {
          minDistanceBetweenFromAndTo: 10.0,
          locationState: {
            hasLocation: true,
            lat: 65,
            lon: 25,
          },
        },
      );
      expectSingleValue(msgIds, 'no-route-origin-same-as-destination');
    });

    it('should return itinerary-in-the-past', () => {
      const msgIds = findErrorMessageIds(
        [],
        {
          walking: true,
          searchTime: new Date('2022-01-01').getTime(),
        },
        {
          currentTime: new Date('2022-01-03').getTime(),
        },
      );
      expectSingleValue(msgIds, 'itinerary-in-the-past');
    });

    describe('out-of-bounds', () => {
      const areaPolygon = [
        [0, 0],
        [50, 0],
        [50, 50],
        [0, 50],
      ];

      it('should return outside-bounds-1 if destination is outside areaPolygon', () => {
        const msgIds = findErrorMessageIds(
          [],
          {
            from: { lat: 25, lon: 25 },
            to: { lat: 100, lon: 100 },
          },
          {
            areaPolygon,
          },
        );
        expectSingleValue(msgIds, 'outside-bounds-1');
      });

      it('should return outside-bounds-2 if origin is outside areaPolygon', () => {
        const msgIds = findErrorMessageIds(
          [],
          {
            from: { lat: 100, lon: 100 },
            to: { lat: 25, lon: 25 },
          },
          {
            areaPolygon,
          },
        );
        expectSingleValue(msgIds, 'outside-bounds-2');
      });

      it('should return outside-bounds-3 if origin and destination are outside areaPolygon', () => {
        const msgIds = findErrorMessageIds(
          [],
          {
            from: { lat: 110, lon: 110 },
            to: { lat: 100, lon: 100 },
          },
          {
            areaPolygon,
          },
        );
        expectSingleValue(msgIds, 'outside-bounds-3');
      });
    });
  });
});
