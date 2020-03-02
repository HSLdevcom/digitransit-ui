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

function request(url, options = {}) {
  return fetch(url, options).then(response => {
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

export function getUser() {
  const options = {
    credentials: 'include',
  };
  return request('/api/user', options);
}

export function getFavourites() {
  return request('/api/user/favourites');
}

export function updateFavourites(data) {
  const options = {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return request('/api/user/favourites', options);
}

export function deleteFavourites(data) {
  const options = {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  return request('/api/user/favourites', options);
}
