export function setSelectedTime(actionContext, data) {
  return actionContext.dispatch('SetSelectedTime', data);
}

export function setArriveBy(actionContext, data) {
  return actionContext.dispatch('SetArriveBy', data);
}

export function setArrivalTime(actionContext, data) {
  return actionContext.dispatch('SetArrivalTime', data);
}

export function setDepartureTime(actionContext, data) {
  return actionContext.dispatch('SetDepartureTime', data);
}

export function unsetSelectedTime(actionContext) {
  return actionContext.dispatch('UnsetSelectedTime');
}
