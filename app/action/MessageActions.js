export function addMessage(actionContext, message) {
  actionContext.dispatch('AddMessage', message);
}

export function updateMessage(actionContext, message) {
  actionContext.dispatch('UpdateMessage', message);
}

export function markMessageAsRead(actionContext, id) {
  actionContext.dispatch('MarkMessageAsRead', id);
}
