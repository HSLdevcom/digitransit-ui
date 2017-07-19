/* eslint-disable import/prefer-default-export */

export const getRoutePath = (from, to) =>
  ['/reitti', encodeURIComponent(from), encodeURIComponent(to)].join('/');
