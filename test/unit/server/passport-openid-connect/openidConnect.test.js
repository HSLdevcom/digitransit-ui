import { isSsoLoginPage } from '../../../../server/passport-openid-connect/openidConnect';

describe('isSsoLoginPage', () => {
  const config = { availableLanguages: ['fi', 'sv', 'en', 'de'] };

  it('accepts the front page in every language', () => {
    ['/', '/en', '/sv/', '/de'].forEach(path =>
      expect(isSsoLoginPage(config, '', path)).toBe(true),
    );
    ['/', '/en', '/sv/', '/etusivu', '/en/etusivu', '/etusivu/'].forEach(path =>
      expect(isSsoLoginPage(config, 'etusivu', path)).toBe(true),
    );
  });

  it('accepts the listed pages in every language', () => {
    ['/reitti/a/b', '/en/pysakit/x', '/de/lahellasi/BUS/x'].forEach(path =>
      expect(isSsoLoginPage(config, 'etusivu', path)).toBe(true),
    );
  });

  it('rejects other pages, with or without a language prefix', () => {
    ['/liikenne', '/en/liikenne', '/etusivu/x', '/en/etusivu/x'].forEach(path =>
      expect(isSsoLoginPage(config, 'etusivu', path)).toBe(false),
    );
  });
});
