/* eslint-disable import/prefer-default-export */

export const getRoutePath = (origin, destination) =>
  ['/reitti', origin, destination].join('/');

export const getItineraryPath = (from, to, idx) =>
  [getRoutePath(from, to), idx].join('/');

const getEndpointPath = (origin, destination) =>
  ['', origin || '-', destination || '-'].join('/');

export const endpointToString = endpoint => `foo${endpoint}`;

const isEmpty = s =>
  s === undefined || s === null || s.trim() === '' || s.trim() === '-';

export const isItinerarySearch = (origin, destination) =>
  !isEmpty(origin) && !isEmpty(destination);

/**
 * if both are set it's itinerary search...
 */
export const getPathWithEndpoints = (origin, destination) =>
  isItinerarySearch(origin, destination)
    ? getRoutePath(origin, destination)
    : getEndpointPath(origin, destination);
