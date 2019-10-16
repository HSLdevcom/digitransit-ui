import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

import RealTimeInformationStore from '../../../app/store/RealTimeInformationStore';

describe('RealtimeInformationStore', () => {
  let store;
  let dispatcher;

  beforeEach(() => {
    dispatcher = sinon.stub();
    store = new RealTimeInformationStore(dispatcher);
  });

  describe('storeClient', () => {
    it('should set client to the given value', () => {
      const data = {
        client: {
          foo: 'bar',
        },
        topics: ['/gtfsrt/vp/test/#'],
      };
      store.storeClient(data);
      expect(store.client).to.deep.equal(data.client);
      expect(store.topics).to.deep.equal(data.topics);
    });
  });

  describe('clearClient', () => {
    it('should clear the client and vehicles', () => {
      store.storeClient({
        client: {
          foo: 'bar',
        },
        topics: ['/gtfsrt/vp/test/#'],
      });
      store.clearClient();
      expect(store.client).to.equal(undefined);
      expect(store.topics).to.equal(undefined);
      expect(store.vehicles).to.deep.equal({});
    });
  });

  describe('resetClient', () => {
    it('should clear the vehicles', () => {
      store.storeClient({
        client: {
          foo: 'bar',
        },
        topics: ['/gtfsrt/vp/test/#'],
      });
      const { vehicles } = store;
      store.resetClient();
      expect(store.vehicles).to.not.equal(vehicles);
      expect(store.topics).to.equal(undefined);
      expect(store.vehicles).to.deep.equal({});
    });
  });

  describe('handleMessage', () => {
    it('should handle a single message', () => {
      const message = {
        id: 'foo',
        bar: 'baz',
      };
      store.handleMessage(message);
      expect(store.vehicles.foo).to.equal(message);
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
      expect(store.vehicles.foo1).to.equal(messages[0]);
      expect(store.vehicles.foo2).to.equal(messages[1]);
    });
  });

  describe('getVehicle', () => {
    it('should return the given vehicle', () => {
      store.handleMessage({
        id: 'foo',
        bar: 'baz',
      });

      const vehicle = store.getVehicle('foo');
      expect(vehicle).to.deep.equal({
        id: 'foo',
        bar: 'baz',
      });
    });
  });
});
