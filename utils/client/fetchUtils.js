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
