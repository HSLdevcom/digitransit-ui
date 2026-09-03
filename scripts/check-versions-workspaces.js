/* eslint-disable no-console */
/**
 * Runs two checks against the workspace packages:
 *
 * 1. checkInternalDependencyRanges(): for every workspace package, verifies
 *    that each of its @digitransit-* dependencies/peerDependencies is a range
 *    that is actually satisfied by the CURRENT version of the referenced
 *    workspace package. This catches stale internal pins (e.g. a package
 *    pinned to an exact old version of a dependency that has since been
 *    bumped), which would otherwise make yarn/npm resolve that dependency
 *    from the public registry instead of the local workspace copy - silently
 *    building against stale, disconnected code. This check always runs,
 *    regardless of $BASE_SHA, since it's a static consistency check on the
 *    current state of the repo, not a diff against history.
 *
 * 2. checkOwnVersionBumps(): fails if a workspace package changed since
 *    $BASE_SHA but its package.json "version" wasn't bumped accordingly.
 *    `lerna publish from-package` only republishes a package when its
 *    committed version is greater than what's already on npm, so a changed
 *    package with an unbumped version would silently never get published.
 *    This check only runs when $BASE_SHA is provided.
 *
 * Usage: BASE_SHA=<git ref> yarn check-versions-workspaces
 *
 * Intended to be run via the "check-versions-workspaces" npm script (so
 * node_modules/.bin, including lerna, is on PATH), not invoked directly.
 */
const { execFileSync } = require('child_process');
const { readFileSync } = require('fs');
const { relative, join } = require('path');
const semver = require('semver');

// Plain ANSI codes (no extra dependency needed): GitHub Actions' log viewer,
// like most terminals, renders these directly. Respect the NO_COLOR
// convention (https://no-color.org/) for anyone piping/redirecting output.
const colorsEnabled = !process.env.NO_COLOR;
const red = text => (colorsEnabled ? `\x1b[31m${text}\x1b[0m` : text);
const green = text => (colorsEnabled ? `\x1b[32m${text}\x1b[0m` : text);

function gitShow(ref, file) {
  try {
    return execFileSync('git', ['show', `${ref}:${file}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

// Runs `lerna ls` with the given extra args and returns the parsed JSON
// package list. Shared by every lerna-ls call in this script so they all
// get consistent execFileSync options and JSON parsing. Always passes
// --all so private packages are never silently dropped before we see them.
function lernaLs(extraArgs) {
  const output = execFileSync(
    'lerna',
    ['ls', '--all', ...extraArgs, '--json', '--loglevel=error'],
    { encoding: 'utf8' },
  );
  return JSON.parse(output);
}

// Checks that every workspace package's @digitransit-* dependency/
// peerDependency ranges are satisfied by the current version of the
// referenced workspace package. devDependencies are intentionally excluded:
// they don't affect published consumers.
function checkInternalDependencyRanges() {
  const allPackages = lernaLs([]);
  const versionByName = new Map(
    allPackages.map(pkg => [pkg.name, pkg.version]),
  );

  const failures = [];

  allPackages.forEach(pkg => {
    const packageDir = relative(process.cwd(), pkg.location);
    const packageJsonPath = join(packageDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    ['dependencies', 'peerDependencies'].forEach(depField => {
      const deps = packageJson[depField] || {};

      Object.entries(deps).forEach(([depName, range]) => {
        if (!depName.startsWith('@digitransit-')) {
          return;
        }

        const currentDepVersion = versionByName.get(depName);

        // Not a workspace package (e.g. an external scoped dependency not
        // managed in this repo) - nothing to check.
        if (!currentDepVersion) {
          return;
        }

        if (!semver.satisfies(currentDepVersion, range)) {
          failures.push({
            name: pkg.name,
            depField,
            depName,
            range,
            currentDepVersion,
          });

          console.error(
            red(
              `✗ ${pkg.name}: ${depField} "${depName}": "${range}" does not ` +
                `match the current version of ${depName} (${currentDepVersion})`,
            ),
          );
        }
      });
    });
  });

  if (failures.length > 0) {
    console.error(
      red(
        '\nThe following internal dependency ranges are stale and must be updated:',
      ),
    );

    failures.forEach(failure => {
      console.error(
        red(
          `  - ${failure.name} → ${failure.depName} (declared "${failure.range}", current ${failure.currentDepVersion})`,
        ),
      );
    });

    console.error(
      red(
        '\nUpdate the declared range so it is satisfied by the current version of the dependency.',
      ),
    );

    return false;
  }

  console.log(
    green('✓ All internal @digitransit-* dependency ranges are satisfied.'),
  );
  return true;
}

// Checks that every workspace package whose files changed since `base` also
// bumped its own "version". Returns false (and logs failures) if not. Returns
// true if there's no base to diff against, nothing changed, or everything
// changed is correctly bumped.
function checkOwnVersionBumps(base) {
  if (!base || /^0+$/.test(base)) {
    // Either unset, or the all-zero SHA GitHub uses for e.g. a brand-new
    // branch push with no prior commit to diff against.
    console.log(
      'No base commit to compare against, skipping version-bump check.',
    );
    return true;
  }

  // Deliberately NOT using --exclude-dependents: a package whose own files
  // didn't change but that depends on a package whose version *did* change
  // still needs its own version bumped too (its effective published
  // behavior/dependency graph changed). Requiring the bump here also nudges
  // whoever makes that bump to double check/update their internal
  // @digitransit-* dependency ranges - the very thing that slipped through
  // previously (see checkInternalDependencyRanges above).
  const changedPackages = lernaLs(['--since', base]);

  if (changedPackages.length === 0) {
    console.log('No packages changed.');
    return true;
  }

  const failures = [];

  changedPackages.forEach(pkg => {
    const packageDir = relative(process.cwd(), pkg.location);
    const packageJsonPath = join(packageDir, 'package.json');

    const currentPackage = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    // Optional: don't require bumps for private packages
    if (currentPackage.private) {
      console.log(green(`✓ ${pkg.name}: private package, skipping`));
      return;
    }

    const previousPackageJson = gitShow(base, packageJsonPath);

    // New package: there is no previous version to bump.
    if (!previousPackageJson) {
      console.log(green(`✓ ${pkg.name}: new package`));
      return;
    }

    const previousPackage = JSON.parse(previousPackageJson);

    if (!semver.gt(currentPackage.version, previousPackage.version)) {
      failures.push({
        name: pkg.name,
        version: currentPackage.version,
      });

      console.error(
        red(
          `✗ ${pkg.name}: version was not bumped (${previousPackage.version} -> ${currentPackage.version})`,
        ),
      );
    } else {
      console.log(
        green(
          `✓ ${pkg.name}: ${previousPackage.version} -> ${currentPackage.version}`,
        ),
      );
    }
  });

  if (failures.length > 0) {
    console.error(red('\nThe following changed packages need a version bump:'));

    failures.forEach(pkg => {
      console.error(red(`  - ${pkg.name} (${pkg.version})`));
    });

    console.error(
      red('\nRun `yarn bump-versions-workspaces` to bump package versions.'),
    );

    return false;
  }

  console.log(green('\nAll changed packages have version bumps.'));
  return true;
}

const internalRangesOk = checkInternalDependencyRanges();
const ownVersionBumpsOk = checkOwnVersionBumps(process.env.BASE_SHA);

process.exit(internalRangesOk && ownVersionBumpsOk ? 0 : 1);
