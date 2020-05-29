// eslint-disable-next-line import/prefer-default-export
export function saveRoutingSettings(actionContext, settings) {
  actionContext.dispatch('saveRoutingSettings', settings);
}
