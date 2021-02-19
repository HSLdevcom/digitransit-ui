export function saveFavourite(actionContext, data, onFail) {
  actionContext.dispatch('SaveFavourite', data, onFail);
}

export function updateFavourites(actionContext, data) {
  actionContext.dispatch('UpdateFavourites', data);
}

export function deleteFavourite(actionContext, data) {
  actionContext.dispatch('DeleteFavourite', data);
}
