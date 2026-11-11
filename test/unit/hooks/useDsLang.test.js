import {
  DS_BUILT_IN_LANGS,
  DS_MESSAGE_KEYS,
  getDsLang,
} from '../../../app/hooks/useDsLang';

const translationFiles = import.meta.glob('../../../app/translations/*.js', {
  eager: true,
});
const translations = Object.assign(
  {},
  ...Object.values(translationFiles).map(file => file.default),
);
const customLangs = Object.keys(translations).filter(
  lang => !DS_BUILT_IN_LANGS.includes(lang),
);
const dsKeys = Object.values(DS_MESSAGE_KEYS).flatMap(Object.values);

describe('useDsLang', () => {
  it.each(customLangs)('%s has all design system messages', lang => {
    const missing = dsKeys.filter(key => translations[lang][key] === undefined);
    expect(missing).toEqual([]);
  });

  it('returns built-in languages as is', () => {
    expect(getDsLang('sv', translations.sv)).toBe('sv');
  });

  it('returns a stable locale object for other languages', () => {
    const locale = getDsLang('de', translations.de);
    expect(locale).toEqual({
      code: 'de',
      messages: expect.objectContaining({
        CloseButton: { close: translations.de.close },
      }),
    });
    expect(getDsLang('de', translations.de)).toBe(locale);
  });
});
