import isString from 'lodash/isString';

/**
 * A simple Java-like hash function for strings.
 *
 * see: https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param {string} str the string to hash.
 */
const hashCode = str => {
  if (!str || str.length === 0 || !isString(str)) {
    return 0;
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr; // eslint-disable-line no-bitwise
    hash |= 0; // eslint-disable-line no-bitwise
  }
  return hash;
};

export default hashCode;
