import { DateTime } from 'luxon';

import RealTimeInformationStore from '../../../app/store/RealTimeInformationStore';

describe('RealtimeInformationStore', () => {
  let store;
  let dispatcher;

  beforeEach(() => {
    dispatcher = vi.fn();
    store = new RealTimeInformationStore(dispatcher);
  });

  describe('storeClient', () => {
    it('should set client to the given value', () => {
      const data = {
        client: {
          foo: 'bar',
          end: () => {},
        },
        topics: ['/gtfsrt/vp/test/#'],
      };
      store.storeClient(data);
      expect(store.client).toEqual(data.client);
      expect(store.topics).toEqual(data.topics);
    });
  });

  describe('clearClient', () => {
    it('should clear the client and vehicles', () => {
      store.storeClient({
        client: {
          foo: 'bar',
          end: () => {},
        },
        topics: ['/gtfsrt/vp/test/#'],
      });
      store.clearClient();
      expect(store.client).toBe(undefined);
      expect(store.topics).toBe(undefined);
      expect(store.vehicles).toEqual({});
    });
  });

  describe('resetClient', () => {
    it('should clear the vehicles', () => {
      store.storeClient({
        client: {
          foo: 'bar',
          end: () => {},
        },
        topics: ['/gtfsrt/vp/test/#'],
      });
      const { vehicles } = store;
      store.resetClient();
      expect(store.vehicles).not.toBe(vehicles);
      expect(store.topics).toBe(undefined);
      expect(store.vehicles).toEqual({});
    });
  });

  describe('handleMessage', () => {
    it('should handle a single message', () => {
      const message = {
        id: 'foo',
        bar: 'baz',
      };
      store.handleMessage(message);
      const receivedAt = DateTime.now().toUnixInteger();
      expect(store.vehicles.foo).toEqual({ ...message, receivedAt });
    });

    it('should handle an array of messages', () => {
      const messages = [
        {
          id: 'foo1',
          bar: 'baz1',
        },
        {
          id: 'foo2',
          bar: 'baz2',
        },
      ];
      store.handleMessage(messages);
      const receivedAt = DateTime.now().toUnixInteger();
      expect(store.vehicles.foo1).toEqual({ ...messages[0], receivedAt });
      expect(store.vehicles.foo2).toEqual({ ...messages[1], receivedAt });
    });
  });

  describe('getVehicle', () => {
    it('should return the given vehicle', () => {
      store.handleMessage({
        id: 'foo',
        bar: 'baz',
      });

      const vehicle = store.getVehicle('foo');
      const receivedAt = DateTime.now().toUnixInteger();
      expect(vehicle).toEqual({
        id: 'foo',
        bar: 'baz',
        receivedAt,
      });
    });
  });
});
