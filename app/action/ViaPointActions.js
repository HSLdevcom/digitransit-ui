export function addViaPoint(actionContext, val) {
  actionContext.dispatch('addViaPoint', val);
}

export function setViaPoints(actionContext, points) {
  actionContext.dispatch('setViaPoints', points);
}

export function deleteViaPoint(actionContext, val) {
  actionContext.dispatch('deleteViaPoint', val);
}
