export default function isRelayNetworkError(error) {
  let errorMsg = error;
  if (typeof error !== 'string') {
    if (error) {
      errorMsg = error.message || error.toString();
    } else {
      errorMsg = '';
    }
  }
  return (
    errorMsg.includes(
      'Server does not return response for request at index ',
    ) || errorMsg.includes('Reached request timeout')
  );
}
