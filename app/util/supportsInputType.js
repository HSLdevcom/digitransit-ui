export default function supportsInputType(inputType) {
  if (typeof document !== 'undefined') {
    const input = document.createElement('input');
    input.setAttribute('type', inputType);
    const desiredType = input.getAttribute('type');
    let supported = false;
    if (input.type === desiredType) {
      supported = true;
    }
    input.value = 'Hello world';
    const helloWorldAccepted = (input.value === 'Hello world');
    switch (desiredType) {
      case 'email':
      case 'url':
        if (!input.validationMessage) {
          supported = false;
        }
        break;
      case 'color':
      case 'date':
      case 'datetime':
      case 'month':
      case 'number':
      case 'time':
      case 'week':
        if (helloWorldAccepted) {
          supported = false;
        }
        break;
      default:
        break;
    }
    return supported;
  }
  return true;
}
