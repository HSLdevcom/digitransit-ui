import {
  getLanguageFromPath,
  createLanguageHref,
  getLanguagePrefix,
} from '../../../../utils/shared/languageUtils';

const config = {
  defaultLanguage: 'fi',
  availableLanguages: ['fi', 'sv', 'en'],
};

describe('getLanguageFromPath', () => {
  it('reads an available language prefix', () => {
    expect(getLanguageFromPath(config, '/sv/x')).toBe('sv');
    expect(getLanguageFromPath(config, '/fi/x')).toBe('fi');
  });

  it('uses the default language for anything else', () => {
    ['/', '/x', '/de/x', '/english/x'].forEach(path =>
      expect(getLanguageFromPath(config, path)).toBe('fi'),
    );
  });
});

describe('getLanguagePrefix', () => {
  it('has no prefix for the default language', () => {
    expect(getLanguagePrefix(config, 'fi')).toBe('');
  });

  it('prefixes other languages', () => {
    expect(getLanguagePrefix(config, 'en')).toBe('/en');
  });
});

describe('createLanguageHref', () => {
  const location = { pathname: '/reitti/a/b', search: '?time=1' };

  it('links to the current page in another language', () => {
    expect(createLanguageHref(config, 'en', location)).toBe(
      '/en/reitti/a/b?time=1',
    );
  });

  it('links to the default language without a prefix', () => {
    expect(createLanguageHref(config, 'fi', location)).toBe(
      '/reitti/a/b?time=1',
    );
  });

  it('never links to another site', () => {
    const crafted = { pathname: '//example.com/x', search: '' };
    expect(createLanguageHref(config, 'fi', crafted)).toBe('/example.com/x');
    expect(
      createLanguageHref(config, 'fi', {
        ...crafted,
        pathname: '/\\example.com',
      }),
    ).toBe('/example.com');
  });

  it('uses the root for an empty router pathname', () => {
    const root = { pathname: '', search: '' };
    expect(createLanguageHref(config, 'fi', root)).toBe('/');
    expect(createLanguageHref(config, 'sv', root)).toBe('/sv/');
  });
});
