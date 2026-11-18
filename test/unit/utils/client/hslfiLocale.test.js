import {
  DS_MESSAGE_KEYS,
  hslfiLocale,
  initHslfiLocale,
} from '../../../../utils/client/hslfiLocale';

const translationFiles = import.meta.glob('../../../../app/translations/*.js', {
  eager: true,
});
const translations = Object.assign(
  {},
  ...Object.values(translationFiles).map(file => file.default),
);
// languages with built-in texts in the design system
const builtInLangs = ['fi', 'sv', 'en'];
const customLangs = Object.keys(translations).filter(
  lang => !builtInLangs.includes(lang),
);
const dsKeys = Object.values(DS_MESSAGE_KEYS).flatMap(Object.values);

describe('hslfiLocale', () => {
  it.each(customLangs)('%s has all design system messages', lang => {
    const missing = dsKeys.filter(key => translations[lang][key] === undefined);
    expect(missing).toEqual([]);
  });

  it('builds the locale object from translations', () => {
    initHslfiLocale('de', translations.de);
    expect(hslfiLocale).toEqual({
      code: 'de',
      messages: expect.objectContaining({
        CloseButton: { close: translations.de.close },
      }),
    });
  });

  it('leaves missing translations out so the design system defaults apply', () => {
    initHslfiLocale('sv', { close: 'Stäng' });
    expect(hslfiLocale.messages.CloseButton).toEqual({ close: 'Stäng' });
    expect(hslfiLocale.messages.Button).toEqual({});
    expect(hslfiLocale.messages.FormField).toEqual({});
  });
});
