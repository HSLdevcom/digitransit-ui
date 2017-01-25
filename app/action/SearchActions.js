// eslint-disable-next-line import/prefer-default-export
export function saveSearch(actionContext, endpoint) {
  actionContext.dispatch('SaveSearch', endpoint);
}
