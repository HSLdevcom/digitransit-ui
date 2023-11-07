export class FetchError extends Error {}
FetchError.prototype.name = 'FetchError';

export const fetchWithErrors = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = new FetchError(`${res.url}: ${res.status} ${res.statusText}`);
    error.reqUrl = url;
    error.reqOptions = options;
    error.res = res;
    throw error;
  }

  return res;
};

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
export const retryFetch = async (
  URL,
  _options = {},
  retryCount,
  retryDelay,
  config = {},
) => {
  const options = {
    ..._options,
    headers: addSubscriptionHeader(_options.headers, config),
  };

  let retriesLeft = retryCount;
  while (retriesLeft >= 0) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fetchWithErrors(URL, options);
    } catch (error) {
      if (!(error instanceof FetchError)) {
        // Throwing unrelated errors (e.g. TypeError) allows us to catch bugs.
        throw error;
      }

      if (error.res.status === 401) {
        // todo: throw `error` instead of a literal (breaking change)
        // eslint-disable-next-line no-throw-literal
        throw 401;
      }
      if (retriesLeft === 0) {
        // todo: throw `error` instead of a literal (breaking change)
        // eslint-disable-next-line no-throw-literal
        throw `${URL}: ${error.res.statusText}`;
      }
      retriesLeft -= 1;
      // eslint-disable-next-line no-await-in-loop
      await delay(retryDelay);
    }
  }
  // This should be unreachable, but the linter demands a consistent return.
  return null;
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
  return fetchWithErrors(
    addSubscriptionParam(addLocaleParam(URL, lang), config),
    {
      headers: { 'Accept-Language': lang },
    },
  );
};
