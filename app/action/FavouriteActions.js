export function addFavouriteLocation(actionContext, location) {
  actionContext.dispatch('AddFavouriteLocation', location);
}

export function deleteFavouriteLocation(actionContext, location) {
  actionContext.dispatch('DeleteFavouriteLocation', location);
}

export function deleteFavouriteStop(actionContext, stop) {
  actionContext.dispatch('DeleteFavouriteStop', stop);
}

export function addFavouriteRoute(actionContext, routeId) {
  actionContext.dispatch('AddFavouriteRoute', routeId);
}

export function addFavouriteStop(actionContext, stop) {
  actionContext.dispatch('AddFavouriteStop', stop);
}

export function toggleFavouriteCityBikeStation(actionContext, stationId) {
  actionContext.dispatch('ToggleFavouriteCityBikeStation', stationId);
}

export function addFavourite(actionContext, data) {
  actionContext.dispatch('AddFavourite', data);
}

export function deleteFavourite(actionContext, data) {
  actionContext.dispatch('DeleteFavourite', data);
}
