import ceil from 'lodash/ceil';
import Pbf from 'pbf';

export const parseFeed = (feed, agency, trackedRoutes) => {
  if (trackedRoutes.length === 0) {
    return null;
  }

  const messages = [];
  feed.entity.forEach(entity => {
    const vehiclePos = entity.vehicle;
    if (vehiclePos) {
      const { trip, position, vehicle } = vehiclePos;
      if (trip && position && vehicle) {
        const trackedRoute = trackedRoutes.find(
          item => item.route === trip.route_id,
        );
        if (trackedRoute) {
          const message = {
            id: `${agency}:${vehicle.id}`,
            route: `${agency}:${trackedRoute.gtfsId}`,
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
  return messages.length > 0 ? messages : null;
};

export default class GtfsRtParser {
  constructor(agency, bindings) {
    this.agency = agency;
    this.feedParser = bindings.FeedMessage.read;
  }

  parse(data, trackedRoutes) {
    const pbf = new Pbf(data);
    const feed = this.feedParser(pbf);
    return parseFeed(feed, this.agency, trackedRoutes);
  }
}
