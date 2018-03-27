export function addFavouriteLocation(actionContext, location) {
  actionContext.dispatch('AddFavouriteLocation', location);
}

export function deleteFavouriteLocation(actionContext, location) {
  actionContext.dispatch('DeleteFavouriteLocation', location);
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
