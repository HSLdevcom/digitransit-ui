import { expect } from 'chai';
import { describe, it } from 'mocha';
import findMessageIds from '../../../app/component/ItinerarySummaryListContainer/components/findMessageId';

const expectSingleValue = (arr, expected) => {
  expect(arr.length).to.equal(1);
  expect(arr[0]).to.equal(expected);
};

const expectToContain = (arr, expected) => {
  expect(arr.indexOf(expected) >= 0).to.equal(true);
};

describe('findMessageIds', () => {
  describe('routerErrors', () => {
    it('should return no-transit-connection', async () => {
      const msgIds = findMessageIds([
        { code: 'NO_TRANSIT_CONNECTION', inputField: null },
      ]);
      expectSingleValue(msgIds, 'no-transit-connection');
    });

    it('should return no-transit-connection-in-search-window', async () => {
      const msgIds = findMessageIds([
        { code: 'NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW', inputField: null },
      ]);
      expectSingleValue(msgIds, 'no-transit-connection-in-search-window');
    });

    it('should return outside-bounds-1', async () => {
      const msgIds = findMessageIds([
        { code: 'OUTSIDE_BOUNDS', inputField: 'TO' },
      ]);
      expectSingleValue(msgIds, 'outside-bounds-1');
    });

    it('should return outside-bounds-2', async () => {
      const msgIds = findMessageIds([
        { code: 'OUTSIDE_BOUNDS', inputField: 'FROM' },
      ]);
      expectSingleValue(msgIds, 'outside-bounds-2');
    });

    it('should return outside-bounds-3', async () => {
      const msgIds = findMessageIds([
        { code: 'OUTSIDE_BOUNDS', inputField: 'FROM' },
        { code: 'OUTSIDE_BOUNDS', inputField: 'TO' },
      ]);
      expectSingleValue(msgIds, 'outside-bounds-3');
    });

    it('should return multiple message ids', () => {
      const msgIds = findMessageIds([
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
      // too close
    });

    it('should return no-route-already-at-destination', () => {
      // too close
    });
  });
});
