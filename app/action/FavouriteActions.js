export function saveFavourite(actionContext, data) {
  actionContext.dispatch('SaveFavourite', data);
}

export function updateFavourites(actionContext, data) {
  actionContext.dispatch('UpdateFavourites', data);
}

export function deleteFavourite(actionContext, data) {
  actionContext.dispatch('DeleteFavourite', data);
}
