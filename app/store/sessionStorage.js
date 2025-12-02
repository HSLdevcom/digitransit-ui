function handleSecurityError(error, logMessage) {
  if (error.name === 'SecurityError') {
    if (logMessage) {
      console.log(logMessage); // eslint-disable-line no-console
    }
  } else {
    throw error;
  }
}

export const getSessionStorage = (errorHandler = handleSecurityError) => {
  try {
    return window.sessionStorage;
  } catch (error) {
    errorHandler(error);
    return null;
  }
};

function setItem(key, value) {
  const sessionStorage = getSessionStorage();
  if (sessionStorage) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // eslint-disable-next-line no-console
        console.log(
          '[sessionStorage]' + // eslint-disable-line no-console
            ' Unable to save state; sessionStorage is not available in Safari private mode',
        );
      } else {
        handleSecurityError(
          error,
          '[sessionStorage]' +
            ' Unable to save state; access to sessionStorage denied by browser settings',
        );
      }
    }
  }
}

function getItem(key) {
  const sessionStorage = getSessionStorage();
  if (sessionStorage) {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      handleSecurityError(error);
    }
  }
  return null;
}

function getItemAsJson(key, defaultValue) {
  let item = getItem(key);

  if (item == null) {
    item = defaultValue || '[]';
  }

  return JSON.parse(item);
}

export function setSessionMessageIds(data) {
  setItem('messages', data);
}

export function getSessionMessageIds() {
  return getItemAsJson('messages', '[]');
}
