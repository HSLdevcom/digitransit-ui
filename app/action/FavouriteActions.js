export function saveFavourite(actionContext, data, onFail) {
  actionContext.dispatch('SaveFavourite', data, onFail);
}

export function updateFavourites(actionContext, data, onFail) {
  actionContext.dispatch('UpdateFavourites', data, onFail);
}

export function deleteFavourite(actionContext, data, onFail) {
  actionContext.dispatch('DeleteFavourite', data, onFail);
}
