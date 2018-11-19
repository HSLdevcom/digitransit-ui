import ceil from 'lodash/ceil';
import Pbf from 'pbf';

function findTracked(trip, trackedRoutes) {
  for (let i = 0; i < trackedRoutes.length; i++) {
    if (trackedRoutes[i].route === trip.route_id) {
      return trackedRoutes[i];
    }
  }
  return null;
}

export default class GtfsRtParser {
  constructor(agency, bindings) {
    this.agency = agency;
    this.feedParser = bindings.FeedMessage.read;
  }

  parse(data, trackedRoutes) {
    let found = false;
    const messages = [];

    const pbf = new Pbf(data);
    const feed = this.feedParser(pbf);

    feed.entity.forEach(entity => {
      const vehiclePos = entity.vehicle;
      if (vehiclePos) {
        const { trip, position, vehicle } = vehiclePos;
        if (trip && position && vehicle) {
          const trackedRoute = findTracked(trip, trackedRoutes);
          if (trackedRoute) {
            found = true;
            const message = {
              id: `${this.agency}:${vehicle.id}`,
              route: `${this.agency}:${trackedRoute.gtfsId}`,
              direction: trip.direction_id || 0,
              tripStartTime: trip.start_time.replace(/:/g, ''),
              operatingDay: trip.start_date,
              mode: trackedRoute.mode || 'bus',
              next_stop: vehiclePos.stop_id,
              timestamp: vehiclePos.timestamp || feed.header.timestamp,
              lat: ceil(position.latitude, 5),
              long: ceil(position.longitude, 5),
              heading: position.bearing ? Math.floor(position.bearing) : 0,
            };
            messages.push(message);
          }
        }
      }
    });
    if (found) {
      return messages;
    }
    return null;
  }
}
