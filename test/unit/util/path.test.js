import { pathJoin } from '../../../app/util/path';

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
});
