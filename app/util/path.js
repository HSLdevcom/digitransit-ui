export const getRoutePath = (from, to) => // eslint-disable-line import/prefer-default-export
  ['/reitti', encodeURIComponent(from), encodeURIComponent(to)].join('/');
