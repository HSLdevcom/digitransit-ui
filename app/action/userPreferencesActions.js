/* eslint-disable import/prefer-default-export */

export function setLanguage(actionContext, language) {
  actionContext.dispatch('SetLanguage', language);
}
