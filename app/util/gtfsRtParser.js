import ceil from 'lodash/ceil';
import Pbf from 'pbf';

// eslint-disable-next-line import/prefer-default-export
export const parseFeedMQTT = (feedParser, data, topic, agency, mode) => {
  const pbf = new Pbf(data);
  const feed = feedParser(pbf);

  // /gtfsrt/vp/<feed_Id>/<agency_id>/<agency_name>/<mode>/<route_id>/<direction_id>/<trip_headsign>/<next_stop>/<start_time>/<vehicle_id>
  const [
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    routeId,
    directionId,
    ,
    ,
    startTime,
    vehicleId,
  ] = topic.split('/');

  const messages = [];
  feed.entity.forEach(entity => {
    const vehiclePos = entity.vehicle;
    if (vehiclePos) {
      const { trip, position, vehicle } = vehiclePos;
      if (trip && position && vehicle) {
        const message = {
          id: `${agency}:${vehicleId}`,
          route: `${agency}:${routeId}`,
          direction: parseInt(directionId, 10) || 0,
          tripStartTime: startTime.replace(/:/g, ''),
          operatingDay: trip.start_date,
          mode: mode || 'bus',
          next_stop: undefined,
          timestamp: vehiclePos.timestamp || feed.header.timestamp,
          lat: ceil(position.latitude, 5),
          long: ceil(position.longitude, 5),
          heading: position.bearing ? Math.floor(position.bearing) : 0,
        };
        messages.push(message);
      }
    }
  });
  return messages.length > 0 ? messages : null;
};
