import { route } from './ItinerarySearchActions';

export function storeEndpoint(actionContext, { target, endpoint }, done) {
  actionContext.dispatch('setEndpoint', {
    target,
    value: {
      lat: endpoint.lat,
      lon: endpoint.lon,
      address: endpoint.address,
    },
  });

  if (done !== undefined) {
    done();
  }
}

// XXX setEndpoint is only used for map currently
export function setEndpoint(actionContext, payload) {
  actionContext.executeAction(storeEndpoint, payload, e => {
    if (e) {
      // Todo: Show error to user instead
      console.error('Could maybe not store endpoint: ', e);
    }
  });
}

export function setUseCurrent(actionContext, payload) {
  actionContext.dispatch('useCurrentPosition', payload);
  return actionContext.executeAction(route, payload);
}

export function clearOrigin(actionContext) {
  return actionContext.dispatch('clearOrigin');
}

export function clearDestination(actionContext) {
  return actionContext.dispatch('clearDestination');
}

export function clearGeolocation(actionContext) {
  return actionContext.dispatch('clearGeolocation');
}

export function setOriginToDefault(actionContext) {
  return actionContext.executeAction(setEndpoint, {
    target: 'origin',
    endpoint: actionContext.config.defaultEndpoint,
  });
}
