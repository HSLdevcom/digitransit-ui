import path from 'path';

// Shared by webpack.config.js (dev) and vitest.config.js: lets them consume
// the built digitransit-* workspace packages' raw `src/` directly, instead of
// their Rollup `lib/` output, so that neither needs a package build first.
// Production builds and published packages always use `lib/`.

const rootDir = path.resolve(import.meta.dirname, '..');

/**
 * Custom `exports` condition pointing at each built package's `src/` entry.
 * Deliberately not a bare "source": `src/` isn't published, and a generic
 * name could be enabled by a consumer's own tooling.
 */
export const WORKSPACE_SOURCE_CONDITION = 'digitransit-source';

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

const queryUtilsDir = path.join(
  rootDir,
  'digitransit-search-util/packages/digitransit-search-util-query-utils',
);

/**
 * Babel `overrides` for package sources. babel-plugin-relay reads its config
 * from the working directory, which under Rollup is the package itself but
 * here is the repo root (whose Relay config is the app's). query-utils'
 * `graphql` tags need its own artifact directory instead. `eagerEsModules`
 * turns them into `import`s, which webpack and Vite both resolve against
 * the CommonJS artifacts (unlike the `require()` calls Rollup's build emits).
 */
export const workspacePackageBabelOverrides = [
  {
    test: filename => filename.startsWith(path.join(queryUtilsDir, 'src')),
    plugins: [
      [
        'relay',
        {
          artifactDirectory: path.join(queryUtilsDir, 'lib/__generated__'),
          eagerEsModules: true,
        },
      ],
    ],
  },
];
