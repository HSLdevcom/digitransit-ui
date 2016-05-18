function sendPiwik(context, status) {
  if (context.piwik != null) {
    context.piwik.trackEvent('Modal', 'Disruption', status);
  }
}

export function open(actionContext) {
  sendPiwik(actionContext, 'open');
  return actionContext.dispatch('openDisruptionInfo');
}

export function close(actionContext) {
  sendPiwik(actionContext, 'close');
  return actionContext.dispatch('closeDisruptionInfo');
}
