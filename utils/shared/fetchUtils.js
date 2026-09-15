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

const getParamSeparator = url => (url.search(/\?/) === -1 ? '?' : '&');

const addSubscriptionParam = (url, config) => {
  if (config.hasAPISubscriptionQueryParameter) {
    return `${encodeURI(url)}${getParamSeparator(url)}${
      config.API_SUBSCRIPTION_QUERY_PARAMETER_NAME
    }=${config.API_SUBSCRIPTION_TOKEN}`;
  }
  return encodeURI(url);
};

const addLocaleParam = (url, lang) => {
  if (lang) {
    return `${encodeURI(url)}${getParamSeparator(url)}locale=${lang}`;
  }
  return encodeURI(url);
};

// Tries to fetch 1 + retryCount times until 200 is returned.
// Uses retryDelay (ms) between requests. url and options are normal fetch parameters
export const retryFetch = (
  URL,
  retryCount,
  retryDelay,
  options = {},
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
 * Uses fetch with subscription URL parameter if it is configured.
 * Also adds Accept-Language header based on the given lang and a
 * locale param with the same language. Locale param is used to ensure
 * browser doesn't use cached result with wrong language.
 *
 * @param {String} URL the url to fetch
 * @param {*} config The configuration for the software installation
 * @param {String} lang the user's language
 * @returns fetch's promise
 */

export const fetchWithLanguageAndSubscription = (URL, config, lang) => {
  return fetch(addSubscriptionParam(addLocaleParam(URL, lang), config), {
    headers: { 'Accept-Language': lang },
  });
};
