import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import FutureRouteStore from '@digitransit-store/digitransit-store-future-route';
import './mock-localstorage';

describe('Testing @digitransit-store/digitransit-store-future-route module', () => {
  let store;

  beforeEach(() => {
    store = new FutureRouteStore();
  });

  describe('getFutureRoutes()', () => {
    it("Property 'items' should be found", () => {
      const futureRoutes = store.getFutureRoutes();
      expect(futureRoutes).to.have.property('items').with.lengthOf(0);
    });
  });

  describe('saveFutureRoute(route)', () => {
    const routeInPast = {
      origin: {
        address: 'Pasila, Helsinki',
        coordinates: { lat: 60.198828, lon: 24.933514 },
      },
      destination: {
        address: 'Myyrmäki, Vantaa',
        coordinates: { lat: 60.261238, lon: 24.854782 },
      },
      arriveBy: false,
      time: new Date().getTime() / 1000 - 600,
    };

    const routeInFuture1 = {
      origin: {
        address: 'Pasila, Helsinki',
        coordinates: { lat: 60.198828, lon: 24.933514 },
      },
      destination: {
        address: 'Myyrmäki, Vantaa',
        coordinates: { lat: 60.261238, lon: 24.854782 },
      },
      arriveBy: false,
      time: new Date().getTime() / 1000 + 300,
    };

    const routeInFuture2 = {
      origin: {
        address: 'Pasila, Helsinki',
        coordinates: { lat: 60.198828, lon: 24.933514 },
      },
      destination: {
        address: 'Myyrmäki, Vantaa',
        coordinates: { lat: 60.261238, lon: 24.854782 },
      },
      arriveBy: false,
      time: new Date().getTime() / 1000 + 3600,
    };

    const routeInFuture3 = {
      origin: {
        address: 'Myyrmäki, Vantaa',
        coordinates: { lat: 60.261238, lon: 24.854782 },
      },
      destination: {
        address: 'Pasila, Helsinki',
        coordinates: { lat: 60.198828, lon: 24.933514 },
      },
      arriveBy: true,
      time: new Date().getTime() / 1000 + 7200,
    };

    it("Save should not to add route in past to 'items'", () => {
      store.saveFutureRoute(routeInPast);
      const futureRoutes = store.getFutureRoutes();
      expect(futureRoutes).to.have.property('items').with.lengthOf(0);
    });

    it("Save should add 1st route to 'items'", () => {
      store.saveFutureRoute(routeInFuture1);
      const futureRoutes = store.getFutureRoutes();
      expect(futureRoutes).to.have.property('items').with.lengthOf(1);
    });

    it("Save should not add 2nd route to 'items' (pair of origin and location already exists), only override timestamp", () => {
      const beforeSave = store.getFutureRoutes();
      store.saveFutureRoute(routeInFuture2);
      const afterSave = store.getFutureRoutes();
      expect(beforeSave).not.to.be.equal(afterSave);
      expect(afterSave).to.have.property('items').with.lengthOf(1);
    });

    it("Save should add 2nd route to 'items' (pair of origin and location not exists)", () => {
      store.saveFutureRoute(routeInFuture3);
      const futureRoutes = store.getFutureRoutes();
      expect(futureRoutes).to.have.property('items').with.lengthOf(2);
    });
  });

  describe('clearFutureRoutes()', () => {
    it("Clear should empty 'items'", () => {
      store.clearFutureRoutes();
      const futureRoutes = store.getFutureRoutes();
      expect(futureRoutes).to.have.property('items').with.lengthOf(0);
    });
  });
});
