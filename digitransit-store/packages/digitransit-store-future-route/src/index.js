import sortBy from 'lodash/sortBy';

const DEFAULT_ITINERARY_PREFIX = 'reitti';

/**
 * Builds an itinerary summary URL for a future route entry.
 *
 * @param {Object} item A FutureRoute item, as produced by addFutureRoute.
 * @param {Object} [pathOpts] Options for the generated path.
 * @param {string} [pathOpts.itinerarySummaryPrefix] Path prefix to use instead of the default 'reitti'.
 * @returns {string} The itinerary summary URL, or '' if the item is missing an origin, destination or time.
 * @example
 * const route = {
 *   properties: {
 *     origin: { name: 'Pasila', localadmin: 'Helsinki', coordinates: { lat: 60.198828, lon: 24.933514 } },
 *     destination: { name: 'Ilmala', localadmin: 'Helsinki', coordinates: { lat: 60.208466, lon: 24.919756 } },
 *     arriveBy: true,
 *     time: 1600866900,
 *   },
 * };
 * createUrl(route);
 * //=> '/reitti/Pasila%2C%20Helsinki%3A%3A60.198828%2C24.933514/Ilmala%2C%20Helsinki%3A%3A60.208466%2C24.919756?time=1600866900&arriveBy=true'
 */
export function createUrl(item, pathOpts) {
  const props = item.properties;
  if (
    props.origin?.coordinates &&
    props.destination?.coordinates &&
    props.time
  ) {
    const oLoc = props.origin.localadmin ? `, ${props.origin.localadmin}` : '';
    const oAddr = `${props.origin.name}${oLoc}`;
    const dLoc = props.destination.localadmin
      ? `, ${props.destination.localadmin}`
      : '';
    const dAddr = `${props.destination.name}${dLoc}`;

    let prefix;
    if (pathOpts?.itinerarySummaryPrefix) {
      prefix = pathOpts.itinerarySummaryPrefix;
    } else {
      prefix = DEFAULT_ITINERARY_PREFIX;
    }
    const from = encodeURIComponent(
      `${oAddr}::${props.origin.coordinates.lat},${props.origin.coordinates.lon}`,
    );
    const to = encodeURIComponent(
      `${dAddr}::${props.destination.coordinates.lat},${props.destination.coordinates.lon}`,
    );
    let url = `/${prefix}/${from}/${to}?time=${props.time}`;
    if (props.arriveBy) {
      url += '&arriveBy=true';
    }
    return url;
  }
  return '';
}

function searchId(props) {
  return `${props.origin.name}, ${props.origin.localadmin} - ${props.destination.name}, ${props.destination.localadmin}`;
}

/**
 * Adds a future route to a collection of future routes, replacing any existing entry for the
 * same origin/destination pair and dropping entries whose time has already passed.
 *
 * @param {Object} item The route to add.
 * @param {Object} item.origin
 * @param {string} item.origin.address Comma-separated "name, localadmin" address.
 * @param {{lat: number, lon: number}} item.origin.coordinates
 * @param {Object} item.destination
 * @param {string} item.destination.address Comma-separated "name, localadmin" address.
 * @param {{lat: number, lon: number}} item.destination.coordinates
 * @param {boolean} [item.arriveBy]
 * @param {number} item.time Unix timestamp (seconds) of the future trip.
 * @param {Object[]} [collection] The existing collection of future routes.
 * @returns {Object[]} The updated collection, sorted by time - or the original collection
 * (or an empty array) unchanged if item.time is in the past.
 * @example
 * const newRoute = {
 *   origin: { address: 'Pasila, Helsinki', coordinates: { lat: 60.198828, lon: 24.933514 } },
 *   destination: { address: 'Myyrmäki, Vantaa', coordinates: { lat: 60.261238, lon: 24.854782 } },
 *   arriveBy: false,
 *   time: 1600888888,
 * };
 * addFutureRoute(newRoute, existingFutureRoutes);
 */
export function addFutureRoute(item, collection) {
  const now = new Date().getTime() / 1000;
  if (item && item.time > now) {
    const originAddress = item.origin.address.split(', ');
    const originName = originAddress[0];
    originAddress.shift();
    const originLocalAdmin =
      originAddress.length === 1 ? originAddress[0] : originAddress.join(', ');

    const destinationAddress = item.destination.address.split(', ');
    const destinationName = destinationAddress[0];
    destinationAddress.shift();
    const destinationLocalAdmin =
      destinationAddress.length === 1
        ? destinationAddress[0]
        : destinationAddress.join(', ');

    const routeToAdd = {
      type: 'FutureRoute',
      properties: {
        layer: 'futureRoute',
        origin: {
          name: originName,
          localadmin: originLocalAdmin,
          coordinates: {
            lat: item.origin.coordinates.lat,
            lon: item.origin.coordinates.lon,
          },
        },
        destination: {
          name: destinationName,
          localadmin: destinationLocalAdmin,
          coordinates: {
            lat: item.destination.coordinates.lat,
            lon: item.destination.coordinates.lon,
          },
        },
        arriveBy: item.arriveBy,
        time: item.time,
      },
    };

    const newId = searchId(routeToAdd.properties);

    const futureRoutes = collection
      ? collection.filter(
          r => r.properties.time >= now && searchId(r.properties) !== newId,
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
  return collection || [];
}
