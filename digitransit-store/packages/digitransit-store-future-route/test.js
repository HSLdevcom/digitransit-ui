import { describe, it, expect } from 'vitest';
import { createUrl, addFutureRoute } from './src/index';
import './mock-localstorage';

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
    // Each test below passes an explicit `collection` array (rather than
    // reading/writing a shared localStorage key) so tests stay independent
    // of execution order.
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
      time: (new Date().getTime() / 1000 + 360).toFixed(0),
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

    it('Save should not add a past route as the first item', () => {
      const futureRoutes = addFutureRoute(routeInPast, []);
      expect(futureRoutes).toHaveLength(0);
    });

    it('Save should add the first route item', () => {
      const futureRoutes = addFutureRoute(routeInFuture1, []);
      expect(futureRoutes).toHaveLength(1);
      expect(futureRoutes[0].properties.time).toBe(routeInFuture1.time);
    });

    it('Save should not add a duplicate route item (same origin/destination pair), only override timestamp', () => {
      const oneRouteCollection = addFutureRoute(routeInFuture1, []);
      const futureRoutes = addFutureRoute(routeInFuture2, oneRouteCollection);
      expect(futureRoutes).toHaveLength(1);
      expect(futureRoutes[0].properties.time).toBe(routeInFuture2.time);
    });

    it('Save should add a second route item (different origin/destination pair)', () => {
      const oneRouteCollection = addFutureRoute(routeInFuture1, []);
      const futureRoutes = addFutureRoute(routeInFuture3, oneRouteCollection);
      expect(futureRoutes).toHaveLength(2);
    });

    it('should remove a matching route when its updated time is in the past', () => {
      const oneRouteCollection = addFutureRoute(routeInFuture1, []);
      const twoRouteCollection = addFutureRoute(
        routeInFuture3,
        oneRouteCollection,
      );
      const futureRoutes = addFutureRoute(routeInPast, twoRouteCollection);
      expect(futureRoutes).toHaveLength(1);
      expect(futureRoutes[0].properties.origin.name).toBe('Myyrmäki');
    });

    it('should retain unrelated future routes when a route is updated to the past', () => {
      const oneRouteCollection = addFutureRoute(routeInFuture3, []);
      const futureRoutes = addFutureRoute(
        {
          ...routeInPast,
          origin: routeInFuture1.origin,
          destination: routeInFuture1.destination,
        },
        oneRouteCollection,
      );
      expect(futureRoutes).toHaveLength(1);
      expect(futureRoutes[0].properties.origin.name).toBe('Myyrmäki');
    });

    it('should remove an existing route updated to within five minutes', () => {
      const oneRouteCollection = addFutureRoute(routeInFuture3, []);
      const updatedTime = (new Date().getTime() / 1000 + 120).toFixed(0);
      const futureRoutes = addFutureRoute(
        {
          ...routeInFuture3,
          time: updatedTime,
        },
        oneRouteCollection,
      );
      expect(futureRoutes).toHaveLength(0);
    });

    it('should not add a new route within five minutes', () => {
      const oneRouteCollection = addFutureRoute(routeInFuture3, []);
      const updatedTime = (new Date().getTime() / 1000 + 120).toFixed(0);
      const futureRoutes = addFutureRoute(
        {
          ...routeInPast,
          destination: {
            address: 'Leppävaara, Espoo',
            coordinates: { lat: 60.218, lon: 24.813 },
          },
          time: updatedTime,
        },
        oneRouteCollection,
      );
      expect(futureRoutes).toHaveLength(1);
    });

    it('should leave the collection unchanged when item.time is not a finite number', () => {
      const oneRouteCollection = addFutureRoute(routeInFuture1, []);
      [undefined, null, NaN, 'not-a-number', {}].forEach(invalidTime => {
        const futureRoutes = addFutureRoute(
          { ...routeInFuture3, time: invalidTime },
          oneRouteCollection,
        );
        expect(futureRoutes).toBe(oneRouteCollection);
      });
    });

    it('should return an empty array when item is missing and collection is undefined', () => {
      expect(addFutureRoute(null, undefined)).toEqual([]);
    });
  });
});
