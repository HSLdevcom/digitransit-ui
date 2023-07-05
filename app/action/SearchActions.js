// eslint-disable import/prefer-default-export
export function saveSearch(actionContext, endpoint) {
  actionContext.dispatch('SaveSearch', endpoint);
}

export function removeSearch(actionContext, endpoint) {
  actionContext.dispatch('RemoveSearch', endpoint);
}

export function saveSearchItems(actionContext, items) {
  actionContext.dispatch('SaveSearchItems', items);
}
