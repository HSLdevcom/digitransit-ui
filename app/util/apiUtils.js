import { XMLParser } from 'fast-xml-parser';
import isEmpty from 'lodash/isEmpty';
import { retryFetch } from './fetchUtils';

export function getUser() {
  const options = {
    credentials: 'include',
  };
  return retryFetch('/api/user', 2, 200, options).then(res => res.json());
}

export function getFavourites() {
  return retryFetch('/api/user/favourites', 2, 200).then(res => res.json());
}

export function updateFavourites(data) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return retryFetch('/api/user/favourites', 0, 0, options).then(res =>
    res.json(),
  );
}

export function deleteFavourites(data) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return retryFetch('/api/user/favourites', 0, 0, options).then(res =>
    res.json(),
  );
}

const fiveMinMs = 1000 * 5 * 60;

export function getWeatherData(baseURL, time, lat, lon) {
  // Round time up to next 5 minutes
  const t = fiveMinMs * Math.ceil(time / fiveMinMs);
  const searchTime = new Date(t).toISOString();
  return retryFetch(
    `${baseURL}&latlon=${lat},${lon}&starttime=${searchTime}&endtime=${searchTime}`,
    2,
    200,
  )
    .then(res => res.text())
    .then(str => {
      const parser = new XMLParser({
        ignoreAttributes: true,
        removeNSPrefix: true,
      });
      const json = parser.parse(str);
      const data = json.FeatureCollection.member.map(elem => elem.BsWfsElement);
      return data;
    })
    .catch(err => {
      throw new Error(`Error fetching weather data: ${err}`);
    });
}

export function getRefPoint(origin, destination, location) {
  if (!isEmpty(origin)) {
    return origin;
  }
  if (!isEmpty(destination)) {
    return destination;
  }
  if (location && location.hasLocation) {
    return location;
  }
  return null;
}
