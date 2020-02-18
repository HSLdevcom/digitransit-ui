export function errorLoading(err) {
  /* eslint-disable-next-line no-console */
  console.error('Dynamic page loading failed', err);
}

export function getDefault(module) {
  return module.default;
}
