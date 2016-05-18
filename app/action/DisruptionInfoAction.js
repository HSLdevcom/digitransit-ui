function sendPiwik(context, status) {
  if (context.piwik != null) {
    context.piwik.trackEvent('Modal', 'Disruption', status);
  }
}

export function open(actionContext) {
  actionContext.dispatch('openDisruptionInfo');
  sendPiwik(actionContext, 'open');
}

export function close(actionContext) {
  actionContext.dispatch('closeDisruptionInfo');
  sendPiwik(actionContext, 'close');
}
