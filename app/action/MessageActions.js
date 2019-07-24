export function addMessage(actionContext, message) {
  actionContext.dispatch('AddMessage', message);
}

export function updateMessage(actionContext, id, message) {
  actionContext.dispatch('UpdateMessage', id, message);
}

export function markMessageAsRead(actionContext, id) {
  actionContext.dispatch('MarkMessageAsRead', id);
}
