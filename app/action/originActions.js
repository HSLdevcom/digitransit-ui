export default function storeOrigin(actionContext, origin) {
  actionContext.dispatch('SetOrigin', origin);
}
