export default function supportsInputType(inputType) {
  if (typeof document !== 'undefined') {
    const agent = navigator ? navigator.userAgent : 'unknown';
    const desktopChrome = /Chrome/i.test(agent) && !/Android/i.test(agent);
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
      case 'number':
        if (helloWorldAccepted) {
          supported = false;
        }
        break;
      case 'date':
      case 'datetime':
      case 'month':
      case 'time':
      case 'week':
        if (desktopChrome) {
          supported = false;
        } else {
          supported = !helloWorldAccepted;
        }
        break;
      default:
        break;
    }
    return supported;
  }
  return true;
}
