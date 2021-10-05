export default function isRelayNetworkError(error) {
  return (
    typeof error === 'string' &&
    (error ===
      'Server does not return response for request at index 0.\nResponse should have an array with 1 item(s).' ||
      error.includes('Reached request timeout'))
  );
}
