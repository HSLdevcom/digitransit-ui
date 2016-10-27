export function openFeedbackModal(actionContext) {
  actionContext.dispatch('OpenFeedbackModal');
}

export function closeFeedbackModal(actionContext) {
  actionContext.dispatch('CloseFeedbackModal');
}
