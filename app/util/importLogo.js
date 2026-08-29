import logos from './logoAssets';

/**
 * Resolve a configuration image (logo / graphic) by its path relative to
 * `app/configurations/images/` — always `<dir>/<file>.<ext>` (e.g.
 * `hsl/reittiopas-logo.svg`).
 *
 * `logos` is a build-time `{ '../configurations/images/<dir>/<file>.<ext>': url }`
 * map (see ./logoAssets). Returns a Promise (kept for callers that `await` /
 * `.then` it) resolving to `{ default: <url> }`, or `null` when the path is
 * empty / not a known image.
 */
export default function importLogo(logoPath) {
  if (!logoPath || typeof logoPath !== 'string') {
    return Promise.resolve(null);
  }
  const url = logos[`../configurations/images/${logoPath}`];
  return Promise.resolve(url ? { default: url } : null);
}
