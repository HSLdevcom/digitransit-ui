const delay = ms =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });

const addSubscriptionHeader = (headers, config) => {
  const updatedHeaders = headers || {};
  if (config.hasAPISubscriptionHeader) {
    updatedHeaders[config.API_SUBSCRIPTION_HEADER_NAME] =
      config.API_SUBSCRIPTION_TOKEN;
  }
  return updatedHeaders;
};

const addSubscriptionParam = (url, config) => {
  if (config.hasAPISubscriptionQueryParameter) {
    return `${encodeURI(url)}${url.search(/\?/) === -1 ? '?' : '&'}${
      config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME
    }=${config.API_SUBSCRIPTION_TOKEN}`;
  }
  return encodeURI(url);
};

// Tries to fetch 1 + retryCount times until 200 is returned.
// Uses retryDelay (ms) between requests. url and options are normal fetch parameters
export const retryFetch = (
  URL,
  options = {},
  retryCount,
  retryDelay,
  config = {},
) => {
  return new Promise((resolve, reject) => {
    const retry = retriesLeft => {
      fetch(URL, {
        ...options,
        headers: addSubscriptionHeader(options.headers, config),
      })
        .then(res => {
          if (res.ok) {
            resolve(res);
            // Don't retry if user is not logged in
          } else if (res.status === 401) {
            throw res.status;
          } else {
            // eslint-disable-next-line no-throw-literal
            throw `${URL}: ${res.statusText}`;
          }
        })
        .catch(async err => {
          if (retriesLeft > 0 && err !== 401) {
            await delay(retryDelay);
            retry(retriesLeft - 1);
          } else {
            reject(err);
          }
        });
    };
    retry(retryCount);
  });
};

/**
 * Uses fetch with subscription header with subscription header
 * if it is configured.
 *
 * @param {String} URL the url to fetch
 * @param {*} config The configuration for the software installation
 * @returns fetch's promise
 */
export const fetchWithSubscription = (URL, config) =>
  fetch(addSubscriptionParam(URL, config));
