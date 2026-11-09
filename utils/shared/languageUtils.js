import { pathSegments } from './normalizePath.js';

/**
 * Resolves a path's language: an available language as the first segment,
 * else the default language (served without a prefix).
 * @param {object} config
 * @param {string} path
 * @return {string}
 */
export function languageFromPath(config, path) {
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
export function languagePrefix(config, language) {
  return language === config.defaultLanguage ? '' : `/${language}`;
}
