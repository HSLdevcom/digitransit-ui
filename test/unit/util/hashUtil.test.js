import hashCode from '../../../app/util/hashUtil';

describe('hashUtil', () => {
  it('should return 0 if the input string is falsy', () => {
    expect(hashCode(undefined)).to.equal(0);
  });

  it('should return 0 if the input string has zero length', () => {
    expect(hashCode('')).to.equal(0);
  });

  it('should return 0 if the input is not a string', () => {
    expect(hashCode(['f', 'o', 'o'])).to.equal(0);
  });

  it('should return a numeric hash value', () => {
    expect(hashCode('foo')).to.equal(101574);
    expect(hashCode('bar')).to.equal(97299);
  });
});
