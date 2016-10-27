export function click(actionContext, feature) {
  actionContext.dispatch('openNotImplemented', feature);
}

export function close(actionContext) {
  actionContext.dispatch('closeNotImplemented');
}
