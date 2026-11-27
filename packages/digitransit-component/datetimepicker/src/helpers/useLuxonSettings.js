import { useMemo } from 'react';
import { Settings } from 'luxon';

/**
 * Sets luxon's default locale and time zone, which all date and time formatting of the picker uses.
 * They are set while rendering and not in an effect, so the first render of the children already uses them.
 *
 * @param {string} lang Locale of the formatted dates
 * @param {string} timeZone IANA time zone of the formatted dates
 */
export default function useLuxonSettings(lang, timeZone) {
  useMemo(() => {
    Settings.defaultLocale = lang;
    Settings.defaultZone = timeZone;
  }, [lang, timeZone]);
}
