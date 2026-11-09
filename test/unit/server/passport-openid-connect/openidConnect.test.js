import {
  isSsoLoginPage,
  safeLocalReturnTo,
} from '../../../../server/passport-openid-connect/openidConnect';

describe('safeLocalReturnTo', () => {
  it('accepts a local path', () => {
    expect(safeLocalReturnTo('/en/reitti/a?b=c', '/f')).toBe(
      '/en/reitti/a?b=c',
    );
  });

  it('uses the first value of a repeated param', () => {
    expect(safeLocalReturnTo(['/a', '//example.com'], '/f')).toBe('/a');
  });

  it('falls back for protocol-relative paths', () => {
    ['//example.com', '/\\example.com'].forEach(value =>
      expect(safeLocalReturnTo(value, '/f')).toBe('/f'),
    );
  });

  it('falls back for missing and non-string values', () => {
    [undefined, '', { a: '/b' }].forEach(value =>
      expect(safeLocalReturnTo(value, '/f')).toBe('/f'),
    );
  });
});

describe('isSsoLoginPage', () => {
  const config = { availableLanguages: ['fi', 'sv', 'en', 'de'] };

  it('accepts the front page in every language', () => {
    ['/', '/en', '/sv/', '/de'].forEach(path =>
      expect(isSsoLoginPage(config, '', path)).toBe(true),
    );
    ['/etusivu', '/en/etusivu', '/etusivu/'].forEach(path =>
      expect(isSsoLoginPage(config, 'etusivu', path)).toBe(true),
    );
  });

  it('accepts the listed pages in every language', () => {
    ['/reitti/a/b', '/en/pysakit/x', '/de/lahellasi/BUS/x'].forEach(path =>
      expect(isSsoLoginPage(config, 'etusivu', path)).toBe(true),
    );
  });

  it('rejects other pages, with or without a language prefix', () => {
    ['/liikenne', '/en/liikenne', '/', '/en', '/etusivu/x'].forEach(path =>
      expect(isSsoLoginPage(config, 'etusivu', path)).toBe(false),
    );
  });
});
