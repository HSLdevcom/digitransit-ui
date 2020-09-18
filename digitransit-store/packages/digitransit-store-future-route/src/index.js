/* eslint class-methods-use-this: ["error", { "exceptMethods": ["saveStorage", "createUrl"] }] */
/* eslint-disable no-useless-constructor */
import React from 'react';
import {
  getItemAsJson,
  setItem,
} from '@digitransit-store/digitransit-store-common-functions';
import sortBy from 'lodash/sortBy';

/**
 * @example
 * const store = new FutureRouteStore();
 *
 * //get all
 * const futureRoutes = store.getFutureRoutes();
 * //{
 * //  items: [
 * //    {
 * //      type: 'FutureRoute',
 * //      properties: {
 * //        layer: 'futureRoute',
 * //        origin: {
 * //          name: 'Pasila',
 * //          locality: 'Helsinki',
 * //          coordinates: {
 * //            lat: 60.198828,
 * //            lon: 24.933514,
 * //          },
 * //        },
 * //        destination: {
 * //          name: 'Ilmala',
 * //          locality: 'Helsinki',
 * //          coordinates: {
 * //            lat: 60.208466,
 * //            lon: 24.919756,
 * //          },
 * //        },
 * //        arriveBy: 'true',
 * //        time: 1600866900,
 * //        url: '/reitti/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514/Ilmala%2C%20Helsinki%3A%3A60.208466%2C24.919756?arriveBy=true&time=1600866900',
 * //      },
 * //    },
 * //    {
 * //      type: 'FutureRoute',
 * //      properties: {
 * //        layer: 'futureRoute',
 * //        origin: {
 * //          name: 'Ilmala',
 * //          locality: 'Helsinki',
 * //          coordinates: {
 * //            lat: 60.208466,
 * //            lon: 24.919756,
 * //          },
 * //        },
 * //        destination: {
 * //          name: 'Pasila',
 * //          locality: 'Helsinki',
 * //          coordinates: {
 * //            lat: 60.198828,
 * //            lon: 24.933514,
 * //          },
 * //        },
 * //        time: 1600877700,
 * //        url: '/reitti/Ilmala%2C%20Helsinki%3A%3A60.208466%2C24.919756/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514?arriveBy=true&time=1600877700',
 * //      },
 * //    },
 * //  ],
 * //}
 *
 * //save from Pasila, Helsinki to Myyrmäki, Vantaa in 5 minutes future
 * const newRoute = {
 *   origin: {
 *     address: 'Pasila, Helsinki',
 *     coordinates: { lat: 60.198828, lon: 24.933514 },
 *   },
 *   destination: {
 *     address: 'Myyrmäki, Vantaa',
 *     coordinates: { lat: 60.261238, lon: 24.854782 },
 *   },
 *   arriveBy: false,
 *   time: new Date().getTime() / 1000 + 600,
 * };
 *
 * store.saveFutureRoute(newRoute);
 *
 * //clear / empty all stored future routes
 * store.clearFutureRoutes();
 *
 */
class FutureRoute extends React.Component {
  static storeName = 'FutureRouteStore';

  emptyData = {
    items: [],
  };

  constructor() {
    super();
  }

  getStorage() {
    return getItemAsJson('futureRoutes', JSON.stringify(this.emptyData));
  }

  saveStorage(data) {
    setItem('futureRoutes', data);
  }

  getFutureRoutes() {
    const storage = this.getStorage();
    if (!storage) {
      this.saveStorage(this.emptyData);
    }
    return storage;
  }

  createUrl(route) {
    let url = '/reitti/';
    // set origin
    url += `${encodeURIComponent(
      `${route.origin.address}::${route.origin.coordinates.lat},${route.origin.coordinates.lon}`,
    )}/`;
    // set destination
    url += encodeURIComponent(
      `${route.destination.address}::${route.destination.coordinates.lat},${route.destination.coordinates.lon}`,
    );
    // set arrive by and time
    if (route.arriveBy) {
      url += `?arriveBy=true&time=${route.time}`;
    } else {
      url += `?time=${route.time}`;
    }
    return url;
  }

  saveFutureRoute(route) {
    if (route && route.time > new Date().getTime() / 1000) {
      const originAddress = route.origin.address.split(', ');
      const originName = originAddress[0];
      originAddress.shift();
      const originLocality =
        originAddress.length === 1
          ? originAddress[0]
          : originAddress.join(', ');

      const destinationAddress = route.destination.address.split(', ');
      const destinationName = destinationAddress[0];
      destinationAddress.shift();
      const destinationLocality =
        destinationAddress.length === 1
          ? destinationAddress[0]
          : destinationAddress.join(', ');

      const newRoute = {
        type: 'FutureRoute',
        properties: {
          layer: 'futureRoute',
          origin: {
            name: originName,
            locality: originLocality,
            coordinates: {
              lat: route.origin.coordinates.lat,
              lon: route.origin.coordinates.lon,
            },
          },
          destination: {
            name: destinationName,
            locality: destinationLocality,
            coordinates: {
              lat: route.destination.coordinates.lat,
              lon: route.destination.coordinates.lon,
            },
          },
          arriveBy: route.arriveBy,
          time: route.time,
          url: this.createUrl(route),
        },
      };

      const newRouteOriginAndDestination = `${newRoute.properties.origin.name}, ${newRoute.properties.origin.locality} - ${newRoute.properties.destination.name}, ${newRoute.properties.destination.locality}`;
      const { items } = this.getFutureRoutes();
      const futureRoutes = items.filter(
        r =>
          r.properties.time >= new Date().getTime() / 1000 &&
          `${r.properties.origin.name}, ${r.properties.origin.locality} - ${r.properties.destination.name}, ${r.properties.destination.locality}` !==
            newRouteOriginAndDestination,
      );
      const sortedItems = sortBy(
        [...futureRoutes, newRoute],
        [
          'properties.time',
          'properties.origin.name',
          'properties.destination.name',
        ],
      );
      const storage = {
        items: sortedItems,
      };
      this.saveStorage(storage);
    }
  }

  clearFutureRoutes() {
    this.saveStorage(this.emptyData);
  }

  static handlers = {
    saveFutureRoute: 'saveFutureRoute',
  };
}

const FutureRouteStore = FutureRoute;

export default FutureRouteStore;
