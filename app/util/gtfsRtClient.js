import ceil from 'lodash/ceil';
import Pbf from 'pbf';

function findTracked(trip, options) {
  for (let i = 0; i < options.length; i++) {
    if (options[i].route === trip.route_id) {
      return options[i];
    }
  }
  return null;
}

class GtfsRtClient {
  constructor(settings, actionContext, parser) {
    this.url = settings.gtfsRt;
    this.options = settings.options;
    this.agency = settings.agency;
    this.actionContext = actionContext;
    this.parser = parser;
  }

  parseMessage(feed) {
    let found = false;
    const messages = [];

    feed.entity.forEach(entity => {
      const vehiclePos = entity.vehicle;
      if (vehiclePos) {
        const { trip, position, vehicle } = vehiclePos;
        if (trip && position && vehicle) {
          const trackedRoute = findTracked(trip, this.options);
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
      this.actionContext.dispatch('RealTimeClientMessage', messages);
    }
    this.msgPending = false;
  }

  getMessage() {
    if (this.msgPending) {
      return;
    }
    this.msgPending = true;

    fetch(this.url)
      .then(response => {
        if (response.status !== 200) {
          this.msgPending = false;
          return;
        }
        response.arrayBuffer().then(data => {
          const pbf = new Pbf(data);
          const feed = this.parser.FeedMessage.read(pbf);
          this.parseMessage(feed);
        });
      })
      .catch(() => {
        this.msgPending = false;
      });
  }

  end() {
    clearInterval(this.timer);
  }
}

export default function startGtfsRtClient(settings, actionContext) {
  return import('./gtfsrt').then(parser => {
    const client = new GtfsRtClient(settings, actionContext, parser);
    client.timer = setInterval(() => client.getMessage(), 1000);

    return { client };
  });
}
