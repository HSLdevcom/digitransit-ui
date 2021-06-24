import ceil from 'lodash/ceil';
import Pbf from 'pbf';

const parseOccupancyStatus = status => {
  switch (status) {
    case 0:
      return 'EMPTY';
    case 1:
      return 'MANY_SEATS_AVAILABLE';
    case 2:
      return 'FEW_SEATS_AVAILABLE';
    case 3:
      return 'STANDING_ROOM_ONLY';
    case 4:
      return 'CRUSHED_STANDING_ROOM_ONLY';
    case 5:
      return 'FULL';
    case 6:
      return 'NOT_ACCEPTING_PASSENGERS';
    default:
      return 'EMPTY';
  }
};

// eslint-disable-next-line import/prefer-default-export
export const parseFeedMQTT = (feedParser, data, topic, agency) => {
  const pbf = new Pbf(data);
  const feed = feedParser(pbf);

  // /gtfsrt/vp/<feed_Id>/<agency_id>/<agency_name>/<mode>/<route_id>/<direction_id>/<trip_headsign>/<trip_id>/<next_stop>/<start_time>/<vehicle_id>/<geo_hash>/<short_name>/<color>/
  const [
    ,
    ,
    ,
    ,
    ,
    ,
    mode,
    routeId,
    directionId,
    headsign,
    tripId,
    stopId,
    startTime,
    vehicleId,
    geoHashDeg1,
    geoHashDeg2,
    geoHashDeg3,
    geoHashDeg4,
    shortName,
    color,
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
          direction:
            directionId === '' ? undefined : parseInt(directionId, 10) || 0,
          tripStartTime:
            startTime === '' ? undefined : startTime.replace(/:/g, ''),
          operatingDay: trip.start_date,
          mode: mode === '' ? 'bus' : mode.toLowerCase(),
          next_stop: stopId === '' ? undefined : `${agency}:${stopId}`,
          timestamp: vehiclePos.timestamp || feed.header.timestamp,
          lat: ceil(position.latitude, 5),
          long: ceil(position.longitude, 5),
          heading:
            typeof position.bearing === 'number'
              ? Math.floor(position.bearing)
              : undefined,
          headsign: headsign === '' ? undefined : headsign,
          tripId: tripId === '' ? undefined : `${agency}:${tripId}`,
          geoHash: [geoHashDeg1, geoHashDeg2, geoHashDeg3, geoHashDeg4],
          shortName: shortName === '' ? undefined : shortName,
          color: color === '' ? undefined : color,
          occupancyStatus: parseOccupancyStatus(vehiclePos.occupancy_status),
        };
        messages.push(message);
      }
    }
  });
  return messages.length > 0 ? messages : null;
};
