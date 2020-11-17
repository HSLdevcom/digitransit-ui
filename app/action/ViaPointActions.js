export function addViaPoint(actionContext, val) {
  actionContext.dispatch('addViaPoint', val);
}

export function setViaPoints(actionContext, points) {
  actionContext.dispatch('setViaPoints', points);
}
