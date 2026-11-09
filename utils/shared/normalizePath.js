/** Browsers treat both `/` and `\` as path separators. */
const PATH_SEPARATORS = /[\\/]+/;

/** Splits a path into its non-empty segments, treating `\` as `/` like browsers do. */
export function pathSegments(path) {
  return path.split(PATH_SEPARATORS).filter(Boolean);
}

/**
 * Collapses repeated `/` and `\` so the result can't be a protocol-relative
 * URL.
 */
export default function normalizePath(path) {
  return `/${pathSegments(path).join('/')}`;
}
