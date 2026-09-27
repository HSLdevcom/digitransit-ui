// Shared by webpack.config.js (dev) and vitest.config.js: lets them consume
// the built digitransit-* workspace packages' raw `src/` directly, instead of
// their Rollup `lib/` output, so that neither needs a package build first.
// Production builds and published packages always use `lib/`.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

/**
 * `{ name, entry }` for every non-deprecated package with a Rollup build,
 * `entry` being the absolute path of its `src/index.{jsx,js}`. Used to alias
 * each bare package import to its source.
 */
export const workspacePackageSourceEntries = [
  'digitransit-component',
  'digitransit-search-util',
  'digitransit-store',
].flatMap(family => {
  const packagesDir = path.join(root, family, 'packages');
  return fs.readdirSync(packagesDir).flatMap(dir => {
    const pkgDir = path.join(packagesDir, dir);
    const pkg = JSON.parse(
      fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'),
    );
    if (!pkg.scripts?.build || pkg.deprecated) {
      return [];
    }
    const entry = ['src/index.jsx', 'src/index.js']
      .map(file => path.join(pkgDir, file))
      .find(file => fs.existsSync(file));
    if (!entry) {
      throw new Error(`${pkg.name} has no src/index.jsx or src/index.js`);
    }
    return [{ name: pkg.name, entry }];
  });
});

/**
 * `USE_BUILT_WORKSPACE_PACKAGES=true` opts back into the built `lib/` output,
 * e.g. to debug a Rollup build problem.
 */
export const useWorkspacePackageSource =
  process.env.USE_BUILT_WORKSPACE_PACKAGES !== 'true';

/**
 * Matches the `src/` directories of the packages that have a Rollup build
 * (digitransit-util's packages are raw source and need no transform).
 */
export const workspacePackageSourceDir =
  /[\\/]digitransit-(?:component|search-util|store)[\\/]packages[\\/][^\\/]+[\\/]src[\\/]/;
