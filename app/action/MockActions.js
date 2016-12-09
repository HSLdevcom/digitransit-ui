/* eslint-disable import/prefer-default-export */

import range from 'lodash/range';

import { geolocatonCallback } from './PositionActions';

let follow = false;

export function createMock(actionContext, payload, done) {
  window.mock = { data: {} };

  window.mock.data.position = {
    coords: {
      latitude: 60.1992,
      longitude: 24.9402,
      heading: 0,
    },
  };

  window.mock.geolocation = {
    demo() {
      const from = window.mock.data.position.coords;

      const to = {
        latitude: 60.1716,
        longitude: 24.9406,
      };

      const steps = 180;
      const track = range(steps).map((i) => {
        const f = i / steps;
        const variation = (Math.random() * 0.0001) - 0.00005;
        const lat = ((f * to.latitude) + ((1 - f) * from.latitude)) + variation;
        const lon = ((f * to.longitude) + ((1 - f) * from.longitude)) + variation;

        return {
          latitude: lat,
          longitude: lon,
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
        window.mock.geolocation.setCurrentPosition(position.latitude, position.longitude);
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

      window.mock.geolocation.notify();
    },

    setCurrentPosition: (lat, lon, heading, disableDebounce) => {
      window.mock.data.position.coords.latitude = lat;
      window.mock.data.position.coords.longitude = lon;

      if (heading) {
        window.mock.data.position.coords.heading = heading;
      }

      window.mock.geolocation.notify(disableDebounce);
    },

    notify: (disableDebounce, notifyDone) => actionContext.executeAction(
      geolocatonCallback,
      { pos: window.mock.data.position, disableDebounce },
      notifyDone,
    ),
  };

  window.mock.geolocation.notify(true, done);
}
