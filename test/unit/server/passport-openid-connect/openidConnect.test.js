import { safeLocalReturnTo } from '../../../../server/passport-openid-connect/openidConnect';

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
