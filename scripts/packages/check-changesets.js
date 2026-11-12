/**
 * Fails if a package changed since $BASE_SHA but its package.json
 * "version" wasn't bumped accordingly.
 *
 * `lerna publish from-package` only republishes a package when its
 * committed version is greater than what's already on npm, so a changed
 * package with an unbumped version would silently never get published.
 * This check only runs when $BASE_SHA is provided.
 *
 * Usage: BASE_SHA=<git ref> yarn packages-version-check
 *
 * Intended to be run via the "packages-version-check" npm script
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

// Checks that every package whose files changed since `base` also
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
  // behavior/dependency graph changed).
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
      red('\nRun `yarn packages-version-bump` to bump package versions.'),
    );

    return false;
  }

  console.log(green('\nAll changed packages have version bumps.'));
  return true;
}

process.exit(checkOwnVersionBumps(process.env.BASE_SHA) ? 0 : 1);
