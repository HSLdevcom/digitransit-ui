import {
  parseLocalUrl,
  safeLocalReturnTo,
} from '../../../../server/passport-openid-connect/localUrl';

/** A request to https://reittiopas.example, with only the fields read. */
const req = { protocol: 'https', get: () => 'reittiopas.example' };

describe('safeLocalReturnTo', () => {
  it('accepts a local path', () => {
    expect(safeLocalReturnTo(req, '/en/reitti/a?b=c#d', '/f')).toBe(
      '/en/reitti/a?b=c#d',
    );
  });

  it('accepts an absolute URL on this site, as a path', () => {
    expect(safeLocalReturnTo(req, 'https://reittiopas.example/en', '/f')).toBe(
      '/en',
    );
  });

  it('keeps encoded slashes, which browsers read as a path here', () => {
    expect(safeLocalReturnTo(req, '/%2F%2Fexample.com', '/f')).toBe(
      '/%2F%2Fexample.com',
    );
  });

  it('drops line breaks, so the value cannot add a header', () => {
    expect(safeLocalReturnTo(req, '/x\r\nSet-Cookie: a=b', '/f')).toBe(
      '/xSet-Cookie:%20a=b',
    );
  });

  it('uses the first value of a repeated param', () => {
    expect(safeLocalReturnTo(req, ['/a', '//example.com'], '/f')).toBe('/a');
  });

  it('falls back for other sites', () => {
    [
      'https://example.com',
      'http://reittiopas.example',
      '//example.com',
      '/\\example.com',
      '\\\\example.com',
      '/.//example.com',
      '/.\\\\example.com',
      '/a/..//example.com',
      '/%2e//example.com',
      'https://reittiopas.example//example.com',
      'https://reittiopas.example@example.com/',
      'https://example.com#@reittiopas.example',
      'javascript:alert(1)', // eslint-disable-line no-script-url
    ].forEach(value => expect(safeLocalReturnTo(req, value, '/f')).toBe('/f'));
  });

  it('falls back for an invalid Host header', () => {
    const badHost = { protocol: 'https', get: () => 'a b' };
    expect(safeLocalReturnTo(badHost, '/x', '/f')).toBe('/f');
  });

  it('falls back for missing and non-string values', () => {
    [undefined, '', { a: '/b' }].forEach(value =>
      expect(safeLocalReturnTo(req, value, '/f')).toBe('/f'),
    );
  });
});

describe('parseLocalUrl', () => {
  it('gives the pathname without the query', () => {
    expect(parseLocalUrl(req, '/sv?x=1').pathname).toBe('/sv');
  });
});
