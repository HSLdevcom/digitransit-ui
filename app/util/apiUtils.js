const mapStatus = (statusCode /* , message */) => {
  if (statusCode === 400) {
    return 'bad-request';
  }
  if (statusCode === 401) {
    // unauthorized is assumed to be expired session
    return 'expired';
  }
  if (statusCode === 401 || statusCode === 403) {
    return 'unauthorized';
  }
  if (statusCode === 408) {
    return 'timeout';
  }
  if (statusCode === 500) {
    return 'internal-error';
  }
  if (statusCode === 503) {
    return 'unavailable';
  }
  if (statusCode >= 501) {
    return 'backend-error';
  }
  return 'client-error';
};

export function getJson(url) {
  return fetch(url, { credentials: 'include' }).then(response => {
    if (response.ok) {
      return response.json();
    }
    return response
      .text()
      .then(message => {
        throw new Error(mapStatus(response.status, message));
      })
      .catch(() => {
        throw new Error(mapStatus(response.status));
      });
  });
}

export const LoginStates = {
  LOGIN_OK: 'LOGIN_OK',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_EXPIRED: 'LOGIN_EXPIRED',
};

