/**
 * Path-segment locales that pre-date the current locale-cookie/query-param
 * scheme. Requests/URLs under these path prefixes get redirected to the
 * equivalent cookie- or query-param-based URL. Distinct from a deployment's
 * `config.availableLanguages` (which governs actual translation availability
 * today) — this list is fixed across all regions since it's about
 * recognizing old links, not what's currently translated.
 */
export const LEGACY_LOCALES = Object.freeze(['fi', 'en', 'sv', 'ru', 'slangi']);

export const LEGACY_LOCALE_PATHS = Object.freeze(
  LEGACY_LOCALES.map(locale => `/${locale}/`),
);
