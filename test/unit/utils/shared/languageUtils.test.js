import {
  languageFromPath,
  languagePrefix,
} from '../../../../utils/shared/languageUtils';

const config = {
  defaultLanguage: 'fi',
  availableLanguages: ['fi', 'sv', 'en'],
};

describe('languageFromPath', () => {
  it('reads an available language prefix', () => {
    expect(languageFromPath(config, '/sv/x')).toBe('sv');
    expect(languageFromPath(config, '/fi/x')).toBe('fi');
  });

  it('uses the default language for anything else', () => {
    ['/', '/x', '/de/x', '/english/x'].forEach(path =>
      expect(languageFromPath(config, path)).toBe('fi'),
    );
  });
});

describe('languagePrefix', () => {
  it('has no prefix for the default language', () => {
    expect(languagePrefix(config, 'fi')).toBe('');
  });

  it('prefixes other languages', () => {
    expect(languagePrefix(config, 'en')).toBe('/en');
  });
});
