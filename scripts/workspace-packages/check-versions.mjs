/* eslint-disable no-console */
/**
 * Runs two checks against the workspace packages:
 *
 * 1. checkInternalDependencyRanges(): for every workspace package, verifies
 *    that each of its @digitransit-* dependencies/peerDependencies that refers
 *    to another workspace package is declared as exactly "workspace:^".
 *    `lerna version` only rewrites/cascades an internal cross-reference when it
 *    uses the workspace: protocol (see getLocalDependency in lerna's source);
 *    a plain semver pin is silently left untouched on version bumps and never
 *    triggers a cascading bump of the dependent, so on a breaking change it
 *    ends up resolving the dependency from the public registry instead of the
 *    local workspace copy - silently building against stale, disconnected
 *    code. The bare "workspace:^" alias (no pinned version) means the line
 *    itself never needs maintenance; `lerna publish` rewrites it to
 *    "^<version>" in the published tarball. This check always runs, regardless
 *    of $BASE_SHA, since it's a static consistency check on the current state
 *    of the repo, not a diff against history.
 *
 * 2. checkOwnVersionBumps(): fails if a workspace package changed since
 *    $BASE_SHA but its package.json "version" wasn't bumped accordingly.
 *    `lerna publish from-package` only republishes a package when its
 *    committed version is greater than what's already on npm, so a changed
 *    package with an unbumped version would silently never get published.
 *    This check only runs when $BASE_SHA is provided.
 *
 * Usage: BASE_SHA=<git ref> yarn workspace-packages-version-check
 *
 * Intended to be run via the "workspace-packages-version-check" npm script
 * (so node_modules/.bin, including lerna, is on PATH), not invoked directly.
 */
import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { relative, join } from 'path';
import semver from 'semver';

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

// The only spec allowed for an internal @digitransit-* cross-reference.
const REQUIRED_INTERNAL_SPEC = 'workspace:^';

// Checks that every workspace package references its sibling @digitransit-*
// workspace packages via exactly "workspace:^" in dependencies/peerDependencies.
// devDependencies are intentionally excluded: they don't affect published
// consumers, and lerna doesn't cascade through them.
function checkInternalDependencyRanges() {
  const allPackages = lernaLs([]);
  const workspacePackageNames = new Set(allPackages.map(pkg => pkg.name));

  const failures = [];

  allPackages.forEach(pkg => {
    const packageDir = relative(process.cwd(), pkg.location);
    const packageJsonPath = join(packageDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    ['dependencies', 'peerDependencies'].forEach(depField => {
      const deps = packageJson[depField] || {};

      Object.entries(deps).forEach(([depName, spec]) => {
        // Only sibling workspace packages are relevant. An external scoped
        // dependency that merely shares the @digitransit- prefix is skipped.
        if (!workspacePackageNames.has(depName)) {
          return;
        }

        if (spec !== REQUIRED_INTERNAL_SPEC) {
          failures.push({ name: pkg.name, depField, depName, spec });

          console.error(
            red(
              `✗ ${pkg.name}: ${depField} "${depName}": "${spec}" must be ` +
                `"${REQUIRED_INTERNAL_SPEC}"`,
            ),
          );
        }
      });
    });
  });

  if (failures.length > 0) {
    console.error(
      red(
        '\nThe following internal @digitransit-* references do not use the ' +
          `"${REQUIRED_INTERNAL_SPEC}" protocol:`,
      ),
    );

    failures.forEach(failure => {
      console.error(
        red(
          `  - ${failure.name} → ${failure.depName} in ${failure.depField} (declared "${failure.spec}")`,
        ),
      );
    });

    console.error(
      red(
        `\nDeclare every internal @digitransit-* dependency/peerDependency as ` +
          `"${REQUIRED_INTERNAL_SPEC}" so \`lerna version\` maintains it (rewrites ` +
          `and cascades bumps); \`lerna publish\` resolves it to "^<version>" in ` +
          `the published package.`,
      ),
    );

    return false;
  }

  console.log(
    green(
      `✓ All internal @digitransit-* references use "${REQUIRED_INTERNAL_SPEC}".`,
    ),
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
      red(
        '\nRun `yarn workspace-packages-version-bump` to bump package versions.',
      ),
    );

    return false;
  }

  console.log(green('\nAll changed packages have version bumps.'));
  return true;
}

const internalRangesOk = checkInternalDependencyRanges();
const ownVersionBumpsOk = checkOwnVersionBumps(process.env.BASE_SHA);

process.exit(internalRangesOk && ownVersionBumpsOk ? 0 : 1);
