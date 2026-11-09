/** Browsers treat both `/` and `\` as path separators. */
const PATH_SEPARATORS = /[\\/]+/;
/** One leading `/` that isn't followed by another separator. */
const LOCAL_PATH = /^\/(?![\\/])/;

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

/**
 * Whether a path (with an optional query) stays on the same site: it starts
 * with a `/` not followed by another separator, so it isn't protocol-relative
 * like `//host` or `/\host`.
 */
export function isLocalPath(path) {
  return LOCAL_PATH.test(path);
}
