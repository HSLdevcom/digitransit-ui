import { expect } from 'chai';
import { describe, it } from 'mocha';
import { pathJoin } from '../../../app/util/path';

describe('path', () => {
  describe('pathJoin()', () => {
    it('should join paths with intermediate slashes', () => {
      expect(pathJoin(['my'])).to.equal('my');
      expect(pathJoin(['my', 'path'])).to.equal('my/path');
      expect(pathJoin(['my/', 'path'])).to.equal('my/path');
      expect(pathJoin(['my', '/path'])).to.equal('my/path');
      expect(pathJoin(['my/', '/path'])).to.equal('my/path');
      expect(pathJoin(['my', 'long', 'path'])).to.equal('my/long/path');
    });

    it('should not trim single-segment path', () => {
      expect(pathJoin(['/'])).to.equal('/');
    });

    it('should join paths with slashes within segments', () => {
      expect(pathJoin(['my/path'])).to.equal('my/path');
      expect(pathJoin(['my', 'even/longer', 'path'])).to.equal(
        'my/even/longer/path',
      );
    });

    it('should join paths with leading slash', () => {
      expect(pathJoin(['/my', '/path'])).to.equal('/my/path');
      expect(pathJoin(['/my/', 'path'])).to.equal('/my/path');
      expect(pathJoin(['/my/', '/path'])).to.equal('/my/path');
    });

    it('should join paths with trailing slash', () => {
      expect(pathJoin(['my', '/path/'])).to.equal('my/path/');
      expect(pathJoin(['my/', 'path/'])).to.equal('my/path/');
      expect(pathJoin(['/my/', '/path/'])).to.equal('/my/path/');
    });
  });
});
