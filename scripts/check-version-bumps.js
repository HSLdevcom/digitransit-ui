/* eslint-disable no-console */
/**
 * Fails if a workspace package changed since $BASE_SHA but its
 * package.json "version" wasn't bumped accordingly. `lerna publish
 * from-package` only republishes a package when its committed version is
 * greater than what's already on npm, so a changed package with an
 * unbumped version would silently never get published.
 *
 * Usage: BASE_SHA=<git ref> yarn check-package-versions
 *
 * Intended to be run via the "check-package-versions" npm script (so
 * node_modules/.bin, including lerna, is on PATH), not invoked directly.
 */
const { execFileSync } = require('child_process');
const { readFileSync } = require('fs');
const { relative, join } = require('path');
const semver = require('semver');

const base = process.env.BASE_SHA;

if (!base || /^0+$/.test(base)) {
  // Either unset, or the all-zero SHA GitHub uses for e.g. a brand-new
  // branch push with no prior commit to diff against.
  console.log('No base commit to compare against, skipping check.');
  process.exit(0);
}

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

// --exclude-dependents is important:
// we only want packages whose own files changed, not packages merely
// affected because one of their dependencies changed.
const output = execFileSync(
  'lerna',
  ['ls', '--since', base, '--exclude-dependents', '--json', '--loglevel=error'],
  { encoding: 'utf8' },
);

const changedPackages = JSON.parse(output);

if (changedPackages.length === 0) {
  console.log('No packages changed.');
  process.exit(0);
}

const failures = [];

changedPackages.forEach(pkg => {
  const packageDir = relative(process.cwd(), pkg.location);
  const packageJsonPath = join(packageDir, 'package.json');

  const currentPackage = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  // Optional: don't require bumps for private packages
  if (currentPackage.private) {
    console.log(`✓ ${pkg.name}: private package, skipping`);
    return;
  }

  const previousPackageJson = gitShow(base, packageJsonPath);

  // New package: there is no previous version to bump.
  if (!previousPackageJson) {
    console.log(`✓ ${pkg.name}: new package`);
    return;
  }

  const previousPackage = JSON.parse(previousPackageJson);

  if (!semver.gt(currentPackage.version, previousPackage.version)) {
    failures.push({
      name: pkg.name,
      version: currentPackage.version,
    });

    console.error(
      `✗ ${pkg.name}: version was not bumped (${previousPackage.version} -> ${currentPackage.version})`,
    );
  } else {
    console.log(
      `✓ ${pkg.name}: ${previousPackage.version} -> ${currentPackage.version}`,
    );
  }
});

if (failures.length > 0) {
  console.error('\nThe following changed packages need a version bump:');

  failures.forEach(pkg => {
    console.error(`  - ${pkg.name} (${pkg.version})`);
  });

  console.error('\nRun `yarn version-workspaces` to bump package versions.');

  process.exit(1);
}

console.log('\nAll changed packages have version bumps.');
