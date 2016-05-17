export function open(actionContext) {
  return actionContext.dispatch('openDisruptionInfo');
}

export function close(actionContext) {
  return actionContext.dispatch('closeDisruptionInfo');
}
