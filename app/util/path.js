/* eslint-disable import/prefer-default-export */

export const getRoutePath = (from, to) => {
  console.log('getting RoutePath', from, to);
  return ['/reitti', from, to].join('/');
};

export const getItineraryPath = (from, to, idx) =>
  [getRoutePath(from, to), idx].join('/');

const getEndpointPath = (from, to) => ['', from || '-', to || '-'].join('/');

export const endpointToString = endpoint => `foo${endpoint}`;

export const isItinerarySearch = (origin, destination) =>
  origin !== undefined && destination !== undefined;
/**
 * if both are set it's itinerary search...
 */
export const getPathWithEndpoints = (origin, destination) =>
  isItinerarySearch(origin, destination)
    ? getRoutePath(origin, destination)
    : getEndpointPath(origin, destination);
