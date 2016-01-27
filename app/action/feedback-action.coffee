
openFeedbackModal = (actionContext) =>
  actionContext.dispatch "OpenFeedbackModal"

closeFeedbackModal = (actionContext) =>
  actionContext.dispatch "CloseFeedbackModal"

module.exports =
  'openFeedbackModal': openFeedbackModal
  'closeFeedbackModal': closeFeedbackModal
