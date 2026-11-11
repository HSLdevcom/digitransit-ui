import i18n from './i18n';

const BUILT_IN_LANGS = ['fi', 'sv', 'en'];

/**
 * Translation keys of the design system messages used by this package, by
 * namespace. Every language of the translations must contain all of them.
 */
export const DS_MESSAGE_KEYS = {
  CloseButton: { close: 'close' },
};

// The language is fixed at runtime, so this holds a single locale object. The
// language code check below only keeps the result correct if the function is
// called with another language, e.g. in tests.
let cached;

/**
 * Returns the design system `lang` prop value for a language: the language
 * code for built-in languages and languages without translations, otherwise
 * a locale object with messages from this package's translations.
 *
 * @param {string} lang language code
 * @returns {string|{code: string, messages: Object}}
 */
export default function getDsLang(lang) {
  if (
    BUILT_IN_LANGS.includes(lang) ||
    !i18n.hasResourceBundle(lang, 'translation')
  ) {
    return lang;
  }
  if (cached?.code !== lang) {
    cached = {
      code: lang,
      messages: Object.fromEntries(
        Object.entries(DS_MESSAGE_KEYS).map(([namespace, keys]) => [
          namespace,
          Object.fromEntries(
            Object.entries(keys).map(([name, key]) => [
              name,
              i18n.getResource(lang, 'translation', key),
            ]),
          ),
        ]),
      ),
    };
  }
  return cached;
}
