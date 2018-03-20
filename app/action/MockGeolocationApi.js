// replacement for the browser geolocation api location mocking purposes
import d from 'debug';
import range from 'lodash/range';

const debug = d('MockGeolocationApi.js');

export function init(permission, lat, lon) {
  debug('Position mock activated');
  window.mock = { permission, data: {} };

  window.mock.data.position = {
    coords: {
      latitude: lat || 60.1992,
      longitude: lon || 24.9402,
      heading: 0,
    },
  };

  let follow = false;
  window.mock.geolocation = {
    demo() {
      const from = window.mock.data.position.coords;

      const to = {
        latitude: 60.1716,
        longitude: 24.9406,
      };

      const steps = 180;
      const track = range(steps).map(i => {
        const f = i / steps;
        const variation = Math.random() * 0.0001 - 0.00005;
        const latitude = f * to.latitude + (1 - f) * from.latitude + variation;
        const longitude =
          f * to.longitude + (1 - f) * from.longitude + variation;

        return {
          latitude,
          longitude,
        };
      });

      follow = {
        track,
        index: 0,
        interval: setInterval(window.mock.geolocation.followTrack, 1000),
      };
    },

    followTrack() {
      let position;
      const i = follow.index || 0;

      if (follow.track && i < follow.track.length) {
        position = follow.track[i];
        follow.index += 1;
        window.mock.geolocation.setCurrentPosition(
          position.latitude,
          position.longitude,
        );
      } else {
        clearInterval(follow.interval);
        follow = false;
      }
    },

    move: (dlat, dlon, heading) => {
      window.mock.data.position.coords.latitude += dlat;
      window.mock.data.position.coords.longitude += dlon;

      if (heading) {
        window.mock.data.position.coords.heading = heading;
      }
    },

    setCurrentPosition: (latitude, longitude, heading) => {
      window.mock.data.position.coords.latitude = latitude;
      window.mock.data.position.coords.longitude = longitude;

      if (heading) {
        window.mock.data.position.coords.heading = heading;
      }
    },
  };
}

export const api = {
  watchPosition: success => {
    debug('setting mock interval');
    let i = 0;
    setInterval(() => {
      if (window.mock) {
        debug('broadcasting position', window.mock.data.position);
        window.mock.permission = 'granted';
        // debounce does not seem to work within setInterval
        // so disable debounce once every 5 seconds
        success(window.mock.data.position, i % 10 === 0);
        i += 1;
      } else {
        debug('window.mock is undefined');
      }
    }, 500);
  },
};
