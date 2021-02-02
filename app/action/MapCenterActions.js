// eslint-disable-next-line import/prefer-default-export
export function storeCoordsOfMapCenter(actionContext, location) {
  actionContext.dispatch('StoreCoordsOfMapCenter', location);
}
