function isObject(it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
}

export default function(it) {
  const iterFn = it[Symbol.iterator];
  if (typeof iterFn !== 'function') {
    throw TypeError(`${it} is not iterable!`);
  }
  if (!isObject(it)) {
    throw TypeError(`${it} is not an object!`);
  }
  return iterFn.call(it);
}
