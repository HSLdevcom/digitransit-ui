export function addFavouriteLocation(actionContext, location) {
  actionContext.dispatch('AddFavouriteLocation', location);
}

export function addFavouriteRoute(actionContext, routeId) {
  actionContext.dispatch('AddFavouriteRoute', routeId);
}

export function addFavouriteStop(actionContext, stopId) {
  actionContext.dispatch('AddFavouriteStop', stopId);
}
