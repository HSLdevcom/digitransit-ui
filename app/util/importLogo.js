/**
 * Dynamically import a configuration image (logo / graphic) by its path relative
 * to `app/configurations/images/` — always `<dir>/<file>.<ext>` (e.g.
 * `hsl/reittiopas-logo.svg`).
 *
 * Vite's dynamic-import handling requires a literal extension in the static part
 * and each `${}` to span only one path segment, hence the `${dir}/${name}.<ext>`
 * shape with the extension branched explicitly.
 *
 * Resolves to the imported module ({ default: <url|StaticImport> }) or null when
 * the path is empty / malformed / has an unsupported extension.
 */
export default function importLogo(logoPath) {
  if (!logoPath || typeof logoPath !== 'string') {
    return Promise.resolve(null);
  }
  const slash = logoPath.indexOf('/');
  if (slash === -1) {
    return Promise.resolve(null);
  }
  const dir = logoPath.slice(0, slash);
  const rest = logoPath.slice(slash + 1);
  const dot = rest.lastIndexOf('.');
  const name = dot === -1 ? rest : rest.slice(0, dot);
  const ext = dot === -1 ? '' : rest.slice(dot + 1).toLowerCase();

  switch (ext) {
    case 'svg':
      return import(`../configurations/images/${dir}/${name}.svg`);
    case 'png':
      return import(`../configurations/images/${dir}/${name}.png`);
    case 'jpg':
      return import(`../configurations/images/${dir}/${name}.jpg`);
    default:
      return Promise.resolve(null);
  }
}
