import {
  addQueryParams,
  getSearchParams,
  pathJoin,
} from '../../../../utils/shared/path';

describe('path', () => {
  describe('pathJoin()', () => {
    it('should join paths with intermediate slashes', () => {
      expect(pathJoin(['my'])).toBe('my');
      expect(pathJoin(['my', 'path'])).toBe('my/path');
      expect(pathJoin(['my/', 'path'])).toBe('my/path');
      expect(pathJoin(['my', '/path'])).toBe('my/path');
      expect(pathJoin(['my/', '/path'])).toBe('my/path');
      expect(pathJoin(['my', 'long', 'path'])).toBe('my/long/path');
    });

    it('should not trim single-segment path', () => {
      expect(pathJoin(['/'])).toBe('/');
    });

    it('should join paths with slashes within segments', () => {
      expect(pathJoin(['my/path'])).toBe('my/path');
      expect(pathJoin(['my', 'even/longer', 'path'])).toBe(
        'my/even/longer/path',
      );
    });

    it('should join paths with leading slash', () => {
      expect(pathJoin(['/my', '/path'])).toBe('/my/path');
      expect(pathJoin(['/my/', 'path'])).toBe('/my/path');
      expect(pathJoin(['/my/', '/path'])).toBe('/my/path');
    });

    it('should join paths with trailing slash', () => {
      expect(pathJoin(['my', '/path/'])).toBe('my/path/');
      expect(pathJoin(['my/', 'path/'])).toBe('my/path/');
      expect(pathJoin(['/my/', '/path/'])).toBe('/my/path/');
    });
  });

  describe('getSearchParams()', () => {
    it('parses the query of a URL string, keeping repeated keys', () => {
      const params = getSearchParams('/x?a=1&a=%262&b=');
      expect(params.getAll('a')).toEqual(['1', '&2']);
      expect(params.get('b')).toBe('');
    });

    it('parses a URL without a query as empty', () => {
      expect(getSearchParams('/x').size).toBe(0);
    });
  });

  describe('addQueryParams()', () => {
    it('appends encoded params with "?" or "&" as needed', () => {
      expect(addQueryParams('/x', { q: 'a b&c=ä' })).toBe(
        '/x?q=a+b%26c%3D%C3%A4',
      );
      expect(addQueryParams('/x?a=1', { b: 2 })).toBe('/x?a=1&b=2');
    });

    it('skips null and undefined values', () => {
      expect(addQueryParams('/x', { a: null, b: undefined, c: 0 })).toBe(
        '/x?c=0',
      );
    });

    it('keeps repeated keys from URLSearchParams', () => {
      expect(addQueryParams('/x', new URLSearchParams('a=1&a=2'))).toBe(
        '/x?a=1&a=2',
      );
    });

    it('returns the URL unchanged when there are no params', () => {
      expect(addQueryParams('/x', {})).toBe('/x');
      expect(addQueryParams('/x', new URLSearchParams())).toBe('/x');
    });
  });
});
