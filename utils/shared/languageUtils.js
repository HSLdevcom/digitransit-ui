import normalizePath, { pathSegments } from './normalizePath.js';

/**
 * Resolves a path's language: an available language as the first segment,
 * else the default language (served without a prefix).
 * @param {object} config
 * @param {string} path
 * @return {string}
 */
export function getLanguageFromPath(config, path) {
  const [firstSegment] = pathSegments(path);
  return config.availableLanguages.includes(firstSegment)
    ? firstSegment
    : config.defaultLanguage;
}

/**
 * The URL path prefix of a language: none for the deployment's default
 * language, `/{language}` for the others.
 * @param {object} config
 * @param {string} language
 * @return {string}
 */
export function getLanguagePrefix(config, language) {
  return language === config.defaultLanguage ? '' : `/${language}`;
}

/**
 * A link to the current page in another language.
 * @param {object} config
 * @param {string} language
 * @param {{ pathname: string, search: string }} location router location, without the language prefix
 * @return {string}
 */
export function createLanguageHref(config, language, location) {
  return `${getLanguagePrefix(config, language)}${normalizePath(
    location.pathname,
  )}${location.search}`;
}
