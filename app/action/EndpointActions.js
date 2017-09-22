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

export function storeEndpointIfNotCurrent(
  actionContext,
  { target, endpoint },
  done,
) {
  actionContext.dispatch('setEndpointIfNotCurrent', {
    target,
    value: {
      lat: endpoint.lat,
      lon: endpoint.lon,
      address: endpoint.address,
    },
  });

  return done();
}

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

export function swapEndpoints(actionContext, payload) {
  actionContext.dispatch('swapEndpoints');

  return actionContext.executeAction(route, payload, e => {
    if (e) {
      console.error('Could not route:', e);
    }
  });
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
