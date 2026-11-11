import { useIntl } from 'react-intl';

/** Languages with built-in texts in the HSL design system. */
export const DS_BUILT_IN_LANGS = ['fi', 'sv', 'en'];

/**
 * Translation keys of the design system messages, by namespace. Every
 * translation file of a language without built-in design system texts must
 * contain all of them.
 */
export const DS_MESSAGE_KEYS = {
  Button: { loading: 'loading-please-wait' },
  CloseButton: { close: 'close' },
  FormField: { required: 'field-required', optional: 'field-optional' },
  TextInput: { clear: 'clear-button-label' },
};

// The language is fixed at runtime, so this holds a single locale object. The
// language code check below only keeps the result correct if the function is
// called with another language, e.g. in tests.
let cached;

/**
 * Returns the design system `lang` prop value for a language: the language
 * code for built-in languages, otherwise a locale object with the messages.
 * The locale object is cached to keep it stable, as the design system requires.
 *
 * @param {string} lang language code
 * @param {Object} messages translations of the language
 * @returns {string|{code: string, messages: Object}}
 */
export function getDsLang(lang, messages) {
  if (DS_BUILT_IN_LANGS.includes(lang)) {
    return lang;
  }
  if (cached?.code === lang) {
    return cached;
  }
  cached = {
    code: lang,
    messages: Object.fromEntries(
      Object.entries(DS_MESSAGE_KEYS).map(([namespace, keys]) => [
        namespace,
        Object.fromEntries(
          Object.entries(keys).map(([name, key]) => [name, messages[key]]),
        ),
      ]),
    ),
  };
  return cached;
}

/**
 * Returns the design system `lang` prop value for the current language.
 *
 * @returns {string|{code: string, messages: Object}}
 */
export default function useDsLang() {
  const { locale, messages } = useIntl();
  return getDsLang(locale, messages);
}
