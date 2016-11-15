export function saveSearch(actionContext, endpoint) {
  actionContext.dispatch('SaveSearch', endpoint);
}

export function openDialog(actionContext, tab) {
  return actionContext.dispatch('OpenDialog', tab);
}
