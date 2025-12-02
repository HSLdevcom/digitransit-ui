import sortBy from 'lodash/sortBy';

const DEFAULT_ITINERARY_PREFIX = 'reitti';

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
