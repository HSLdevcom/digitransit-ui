import sortBy from 'lodash/sortBy';

/**
 * @example
 * const oldRouteCollection = {
 *   items: [
 *     {
 *       type: 'FutureRoute',
 *       properties: {
 *         layer: 'futureRoute',
 *         origin: {
 *           name: 'Pasila',
 *           locality: 'Helsinki',
 *           coordinates: {
 *             lat: 60.198828,
 *             lon: 24.933514,
 *           },
 *         },
 *         destination: {
 *           name: 'Ilmala',
 *           locality: 'Helsinki',
 *           coordinates: {
 *             lat: 60.208466,
 *             lon: 24.919756,
 *           },
 *         },
 *         arriveBy: 'true',
 *         time: 1600866900,
 *         url: '/reitti/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514/Ilmala%2C%20Helsinki%3A%3A60.208466%2C24.919756?arriveBy=true&time=1600866900',
 *       },
 *     },
 *     {
 *       type: 'FutureRoute',
 *       properties: {
 *         layer: 'futureRoute',
 *         origin: {
 *           name: 'Ilmala',
 *           locality: 'Helsinki',
 *           coordinates: {
 *             lat: 60.208466,
 *             lon: 24.919756,
 *           },
 *         },
 *         destination: {
 *           name: 'Pasila',
 *           locality: 'Helsinki',
 *           coordinates: {
 *             lat: 60.198828,
 *             lon: 24.933514,
 *           },
 *         },
 *         time: 1600877700,
 *         url: '/reitti/Ilmala%2C%20Helsinki%3A%3A60.208466%2C24.919756/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514?arriveBy=true&time=1600877700',
 *       },
 *     },
 *   ],
 * }
 *
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
 *   time: 1600888888,
 * };
 *
 * //add newRoute to oldRouteCollection
 * const newRouteCollection = addFutureRoute(newRoute, oldRouteCollection);
 *
 * const url = createUrl(newRoute);
 * //'/reitti/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514/Myyrmäki%2C%20Vantaa%3A%3A60.261238%2C24.854782?time=1600888888'
 */

export function createUrl(route) {
  if (
    route &&
    route.origin &&
    route.origin.address &&
    route.origin.coordinates &&
    route.destination &&
    route.destination.address &&
    route.destination.coordinates &&
    route.time
  ) {
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
  } else {
    return '';
  }
}

export function addFutureRoute(newRoute, routeCollection) {
  if (newRoute && newRoute.time > new Date().getTime() / 1000) {
    const originAddress = newRoute.origin.address.split(', ');
    const originName = originAddress[0];
    originAddress.shift();
    const originLocality =
      originAddress.length === 1 ? originAddress[0] : originAddress.join(', ');

    const destinationAddress = newRoute.destination.address.split(', ');
    const destinationName = destinationAddress[0];
    destinationAddress.shift();
    const destinationLocality =
      destinationAddress.length === 1
        ? destinationAddress[0]
        : destinationAddress.join(', ');

    const routeToAdd = {
      type: 'FutureRoute',
      properties: {
        layer: 'futureRoute',
        origin: {
          name: originName,
          locality: originLocality,
          coordinates: {
            lat: newRoute.origin.coordinates.lat,
            lon: newRoute.origin.coordinates.lon,
          },
        },
        destination: {
          name: destinationName,
          locality: destinationLocality,
          coordinates: {
            lat: newRoute.destination.coordinates.lat,
            lon: newRoute.destination.coordinates.lon,
          },
        },
        arriveBy: newRoute.arriveBy,
        time: newRoute.time,
        url: createUrl(newRoute),
      },
    };

    const newRouteOriginAndDestination = `${routeToAdd.properties.origin.name}, ${routeToAdd.properties.origin.locality} - ${routeToAdd.properties.destination.name}, ${routeToAdd.properties.destination.locality}`;
    const { items } = routeCollection;
    const futureRoutes = items
      ? items.filter(
          r =>
            r.properties.time >= new Date().getTime() / 1000 &&
            `${r.properties.origin.name}, ${r.properties.origin.locality} - ${r.properties.destination.name}, ${r.properties.destination.locality}` !==
              newRouteOriginAndDestination,
        )
      : [];
    const sortedItems = sortBy(
      [...futureRoutes, routeToAdd],
      [
        'properties.time',
        'properties.origin.name',
        'properties.destination.name',
      ],
    );
    const storage = {
      items: sortedItems,
    };
    return storage;
  }
  return routeCollection || JSON.stringify({ items: [] });
}
