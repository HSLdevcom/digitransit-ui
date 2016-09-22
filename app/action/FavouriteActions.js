export function addFavouriteLocation(actionContext, location) {
  actionContext.dispatch('AddFavouriteLocation', location);
}

export function deleteFavouriteLocation(actionContext, location) {
  actionContext.dispatch('DeleteFavouriteLocation', location);
}

export function addFavouriteRoute(actionContext, routeId) {
  actionContext.dispatch('AddFavouriteRoute', routeId);
}

export function addFavouriteStop(actionContext, stopId) {
  actionContext.dispatch('AddFavouriteStop', stopId);
}

export function toggleFavouriteCityBikeStation(actionContext, stationId) {
  actionContext.dispatch('ToggleFavouriteCityBikeStation', stationId);
}
