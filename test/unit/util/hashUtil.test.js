import hashCode from '../../../app/util/hashUtil';

describe('hashUtil', () => {
  it('should return 0 if the input string is falsy', () => {
    expect(hashCode(undefined)).toBe(0);
  });

  it('should return 0 if the input string has zero length', () => {
    expect(hashCode('')).toBe(0);
  });

  it('should return 0 if the input is not a string', () => {
    expect(hashCode(['f', 'o', 'o'])).toBe(0);
  });

  it('should return a numeric hash value', () => {
    expect(hashCode('foo')).toBe(101574);
    expect(hashCode('bar')).toBe(97299);
  });
});
