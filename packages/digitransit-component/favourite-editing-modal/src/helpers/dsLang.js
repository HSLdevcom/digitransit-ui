import translations from './translations';

// Built once per language, as the design system requires stable locale objects.
const dsLocales = Object.fromEntries(
  Object.entries(translations).map(([code, { translation }]) => [
    code,
    { code, messages: { CloseButton: { close: translation.close } } },
  ]),
);

/**
 * Returns the design system `lang` prop value for a language: a locale object
 * with this package's close text, or the language code itself for languages
 * without translations.
 *
 * @param {string} lang language code
 * @returns {string|{code: string, messages: Object}}
 */
export default function getDsLang(lang) {
  return dsLocales[lang] ?? lang;
}
