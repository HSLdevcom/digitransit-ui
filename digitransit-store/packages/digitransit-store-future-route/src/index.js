import sortBy from 'lodash/sortBy';

/**
 * @example
 * const oldRouteCollection = {
 *   [
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
 * const newRouteCollection = addFutureRoute(newRoute, oldRouteCollection, { prefixItinerarySummary: 'reitti' });
 *
 * const url = createUrl(newRoute, { prefixItinerarySummary: 'reitti' });
 * //'/reitti/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514/Myyrmäki%2C%20Vantaa%3A%3A60.261238%2C24.854782?time=1600888888'
 */

function extractRoute(routeIn) {
  let extractedRoute = routeIn;
  if (routeIn.properties) {
    const route = routeIn.properties;
    extractedRoute = {
      origin: {
        address: `${route.origin.name}, ${route.origin.locality}`,
        coordinates: route.origin.coordinates,
      },
      destination: {
        address: `${route.destination.name}, ${route.destination.locality}`,
        coordinates: route.destination.coordinates,
      },
      arriveBy: route.arriveBy ? route.arriveBy : false,
      time: route.time,
    };
  }
  return extractedRoute;
}

const DEFAULT_ITINERARY_PREFIX = 'reitti';

export function createUrl(routeIn, pathOpts) {
  const route = extractRoute(routeIn);
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
    let prefix;
    if (pathOpts && pathOpts.itinerarySummaryPrefix) {
      prefix = pathOpts.itinerarySummaryPrefix;
    } else {
      prefix = DEFAULT_ITINERARY_PREFIX;
    }

    let url = `/${prefix}/`;
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
  return '';
}

export function addFutureRoute(newRoute, routeCollection, pathOpts) {
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
        url: createUrl(newRoute, pathOpts),
      },
    };

    const newRouteOriginAndDestination = `${routeToAdd.properties.origin.name}, ${routeToAdd.properties.origin.locality} - ${routeToAdd.properties.destination.name}, ${routeToAdd.properties.destination.locality}`;
    const futureRoutes = routeCollection
      ? routeCollection.filter(
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
    return sortedItems;
  }
  return routeCollection || JSON.parse('[]');
}
