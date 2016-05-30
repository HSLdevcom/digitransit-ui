import { locationToOTP } from '../util/otp-strings';
import { getRoutePath } from '../util/path';
import { supportsHistory } from 'history/lib/DOMUtils';
import history from '../history';

export function itinerarySearchRequest(actionContext, options) {
  if (options != null ? options.params : void 0) {
    actionContext.dispatch('UpdateFromToPlaces', {
      to: options.params.to,
      from: options.params.from,
    });
  }

  const time = actionContext.getStore('TimeStore').getSelectedTime();

  if (!actionContext.getStore('TimeStore').isSelectedTimeSet()) {
    return actionContext.dispatch('SetSelectedTime', time);
  }

  return undefined;
}

export function toggleBusState(actionContext) {
  return actionContext.dispatch('ToggleItineraryBusState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleTramState(actionContext) {
  return actionContext.dispatch('ToggleItineraryTramState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleRailState(actionContext) {
  return actionContext.dispatch('ToggleItineraryRailState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleSubwayState(actionContext) {
  return actionContext.dispatch('ToggleItinerarySubwayState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleFerryState(actionContext) {
  return actionContext.dispatch('ToggleItineraryFerryState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleCitybikeState(actionContext) {
  return actionContext.dispatch('ToggleItineraryCitybikeState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function forceCitybikeState(actionContext) {
  return actionContext.dispatch('ForceItineraryCitybikeState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleAirplaneState(actionContext) {
  return actionContext.dispatch('ToggleItineraryAirplaneState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleWalkState(actionContext) {
  return actionContext.dispatch('ToggleItineraryWalkState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleBicycleState(actionContext) {
  return actionContext.dispatch('ToggleItineraryBicycleState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function toggleCarState(actionContext) {
  return actionContext.dispatch('ToggleItineraryCarState',
                                null,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function setWalkReluctance(actionContext, value) {
  return actionContext.dispatch('SetWalkReluctance',
                                value,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function setWalkBoardCost(actionContext, value) {
  return actionContext.dispatch('SetWalkBoardCost',
                                value,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function setMinTransferTime(actionContext, value) {
  return actionContext.dispatch('SetMinTransferTime',
                                value,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function setWalkSpeed(actionContext, value) {
  return actionContext.dispatch('SetWalkSpeed',
                                value,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function setTicketOption(actionContext, value) {
  return actionContext.dispatch('SetTicketOption',
                                value,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function setAccessibilityOption(actionContext, value) {
  return actionContext.dispatch('SetAccessibilityOption',
                                value,
                                actionContext.executeAction(itinerarySearchRequest));
}

export function route(actionContext, payload, done) {
  let to;
  let from;
  let geoString;
  const geolocation = actionContext.getStore('PositionStore').getLocationState();
  const origin = actionContext.getStore('EndpointStore').getOrigin();
  const destination = actionContext.getStore('EndpointStore').getDestination();

  if ((origin.lat || (origin.useCurrentPosition && geolocation.hasLocation)) &&
      (destination.lat || (destination.useCurrentPosition && geolocation.hasLocation))) {
    geoString = locationToOTP(Object.assign({
      address: 'Oma sijainti',
    }, geolocation));

    if (origin.useCurrentPosition) {
      from = geoString;
    } else {
      from = locationToOTP(origin);
    }

    if (destination.useCurrentPosition) {
      to = geoString;
    } else {
      to = locationToOTP(destination);
    }

    if (supportsHistory()) {
      history.push({
        pathname: getRoutePath(from, to),
      });
    }
  }

  return done();
}

export function reset(actionContext) {
  return actionContext.dispatch('Reset');
}
