export function addFavourite(actionContext, data) {
  actionContext.dispatch('AddFavourite', data);
}

export function updateFavourites(actionContext, data) {
  actionContext.dispatch('UpdateFavourites', data);
}

export function deleteFavourite(actionContext, data) {
  actionContext.dispatch('DeleteFavourite', data);
}
