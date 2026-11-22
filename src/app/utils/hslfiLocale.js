/**
 * Translation keys of the design system messages, by namespace. Languages
 * other than fi/sv/en must contain all of them; fi/sv/en fall back to the
 * built-in design system texts for missing keys.
 */
export const DS_MESSAGE_KEYS = {
  Button: { loading: 'loading-please-wait' },
  CloseButton: { close: 'close' },
  FormField: { required: 'field-required', optional: 'field-optional' },
  TextInput: { clear: 'clear-button-label' },
};

/**
 * Design system locale object `{ code, messages }` of the application
 * language. Pass it as the `lang` prop of design system components. The
 * object is filled once at client startup by `initHslfiLocale`, so the
 * reference stays stable, as the design system requires.
 */
export const hslfiLocale = {};

/**
 * Fills the design system locale object from the application translations.
 * Missing translations are left out so that the design system falls back to
 * its built-in texts instead of rendering them empty.
 *
 * @param {string} code language code
 * @param {Object} messages translations of the language
 */
export function initHslfiLocale(code, messages) {
  Object.assign(hslfiLocale, {
    code,
    messages: Object.fromEntries(
      Object.entries(DS_MESSAGE_KEYS).map(([namespace, keys]) => [
        namespace,
        Object.fromEntries(
          Object.entries(keys)
            .filter(([, key]) => messages[key] !== undefined)
            .map(([name, key]) => [name, messages[key]]),
        ),
      ]),
    ),
  });
}
