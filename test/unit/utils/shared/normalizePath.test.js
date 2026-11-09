import { isLocalPath } from '../../../../utils/shared/normalizePath';

describe('isLocalPath', () => {
  it('accepts paths starting with a single slash', () => {
    ['/', '/x', '/en/reitti/a?b=//c', '/a\\b'].forEach(path =>
      expect(isLocalPath(path)).toBe(true),
    );
  });

  it('rejects absolute, relative and protocol-relative URLs', () => {
    [
      '',
      'x',
      'https://example.com',
      '//example.com',
      '/\\example.com',
      '\\\\example.com',
      '\\/example.com',
    ].forEach(path => expect(isLocalPath(path)).toBe(false));
  });
});
