import { describe, it, expect } from 'vitest';
import {
  getItem,
  getItemAsJson,
  removeItem,
  setItem,
} from '@digitransit-store/digitransit-store-common-functions/src/index.js';
import { createUrl, addFutureRoute } from './src/index.js';
import './mock-localstorage.js';

describe('Testing @digitransit-store/digitransit-store-future-route module', () => {
  describe('createUrl(route)', () => {
    // createUrl(item, pathOpts) expects the FutureRoute shape produced by
    // addFutureRoute() - name/localadmin already split out and nested under
    // `.properties` - not the flat { address, coordinates } shape that
    // addFutureRoute() itself takes as input (used in the tests below).
    const route = {
      properties: {
        origin: {
          name: 'Pasila',
          localadmin: 'Helsinki',
          coordinates: { lat: 60.198828, lon: 24.933514 },
        },
        destination: {
          name: 'Myyrmäki',
          localadmin: 'Vantaa',
          coordinates: { lat: 60.261238, lon: 24.854782 },
        },
        arriveBy: false,
        time: 1600757120,
      },
    };
    it('Url should be match', () => {
      const url = createUrl(route);
      expect(url).toBe(
        '/reitti/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514/Myyrm%C3%A4ki%2C%20Vantaa%3A%3A60.261238%2C24.854782?time=1600757120',
      );
    });
  });

  describe('addFutureRoute(newRoute, routeCollection)', () => {
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
      time: (new Date().getTime() / 1000 - 600).toFixed(0),
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
      time: (new Date().getTime() / 1000 + 300).toFixed(0),
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
      time: (new Date().getTime() / 1000 + 3600).toFixed(0),
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
      time: (new Date().getTime() / 1000 + 7200).toFixed(0),
    };

    it('Save should not to add past route as 1st item', () => {
      const futureRoutes = addFutureRoute(
        routeInPast,
        getItemAsJson('digitransit-store-future-route-test'),
      );
      setItem('digitransit-store-future-route-test', futureRoutes);
      expect(futureRoutes).toHaveLength(0);
    });

    it('Save should add 1st route item', () => {
      const futureRoutes = addFutureRoute(
        routeInFuture1,
        getItemAsJson('digitransit-store-future-route-test'),
      );
      setItem('digitransit-store-future-route-test', futureRoutes);
      expect(futureRoutes).toHaveLength(1);
    });

    it('Save should not add 2nd route item (pair of origin and location already exists), only override timestamp', () => {
      const beforeSave = getItemAsJson('digitransit-store-future-route-test');
      const futureRoutes = addFutureRoute(
        routeInFuture2,
        getItemAsJson('digitransit-store-future-route-test'),
      );
      setItem('digitransit-store-future-route-test', futureRoutes);
      const afterSave = getItemAsJson('digitransit-store-future-route-test');
      expect(beforeSave).not.toBe(afterSave);
      expect(afterSave).toHaveLength(1);
    });

    it('Save should add 2nd route item (pair of origin and location not exists)', () => {
      const futureRoutes = addFutureRoute(
        routeInFuture3,
        getItemAsJson('digitransit-store-future-route-test'),
      );
      setItem('digitransit-store-future-route-test', futureRoutes);
      expect(futureRoutes).toHaveLength(2);
    });

    it('Save should not to add route in past as 3rd item', () => {
      const futureRoutes = addFutureRoute(
        routeInPast,
        getItemAsJson('digitransit-store-future-route-test'),
      );
      setItem('digitransit-store-future-route-test', futureRoutes);
      expect(futureRoutes).toHaveLength(2);
    });
  });

  describe('clearFutureRoutes()', () => {
    it("Clear should empty 'items'", () => {
      removeItem('digitransit-store-future-route-test');
      const item = getItem('digitransit-store-future-route-test');
      expect(item).toBeNull();
    });
  });
});
