/**
 * Fails a PR whose changed packages aren't all released by a changeset, or
 * that edits a package's "version" by hand (the Version packages PR does that).
 *
 * Changed packages include dependents (dev dependencies too), so a change to
 * e.g. the private schema or rollup-config package needs changesets for the
 * packages built from it. Packages Changesets bumps automatically as
 * dependents count as released.
 *
 * Usage: [BASE_REF=<branch>] yarn packages-changeset-check
 * Diffs against the merge-base with origin/$BASE_REF (default v3).
 */
import { execFileSync } from 'child_process';
import { mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, relative } from 'path';

const colorsEnabled = !process.env.NO_COLOR;
const red = text => (colorsEnabled ? `\x1b[31m${text}\x1b[0m` : text);
const green = text => (colorsEnabled ? `\x1b[32m${text}\x1b[0m` : text);

const run = (command, args) =>
  execFileSync(command, args, { encoding: 'utf8' }).trim();

/** Packages changed since `base`, dependents included unless excluded. */
function changedPackages(base, { excludeDependents = false } = {}) {
  return JSON.parse(
    run('lerna', [
      'ls',
      '--all',
      '--since',
      base,
      ...(excludeDependents ? ['--exclude-dependents'] : []),
      '--json',
      '--loglevel=error',
    ]),
  );
}

/**
 * Names of the packages the pending changesets bump, auto-bumped dependents
 * included. Returns null when `changeset status` fails, e.g. because packages
 * changed but there are no changesets; it prints its own message.
 */
function plannedReleases(base) {
  const directory = mkdtempSync(join(tmpdir(), 'changeset-status-'));
  const output = join(directory, 'status.json');
  try {
    try {
      execFileSync(
        'changeset',
        ['status', `--since=${base}`, `--output=${output}`],
        { stdio: ['ignore', 'inherit', 'inherit'] },
      );
    } catch (error) {
      if (typeof error.status === 'number') {
        return null;
      }
      throw error;
    }
    const { releases } = JSON.parse(readFileSync(output, 'utf8'));
    // Dev dependents are listed with type "none": their range is updated, but
    // they aren't bumped or published.
    return new Set(
      releases
        .filter(release => release.type !== 'none')
        .map(release => release.name),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

/** Errors for changed packages whose "version" differs from `base`. */
function findVersionEdits(changed, base) {
  return changed
    .filter(pkg => {
      const packageJsonPath = join(
        relative(process.cwd(), pkg.location),
        'package.json',
      );
      let previous;
      try {
        previous = JSON.parse(
          run('git', ['show', `${base}:${packageJsonPath}`]),
        ).version;
      } catch {
        return false; // New package.
      }
      return previous !== pkg.version;
    })
    .map(
      pkg =>
        `${pkg.name}: "version" was edited; the Version packages PR sets versions`,
    );
}

/**
 * Errors for changed public packages that no changeset releases. Releasing a
 * changed package often releases its dependents too, so they're only
 * reported once every directly changed package has a changeset.
 */
function findUncoveredPackages(changed, base, released) {
  const unreleased = changed.filter(
    pkg => !pkg.private && !released.has(pkg.name),
  );
  const directlyChanged = new Set(
    changedPackages(base, { excludeDependents: true }).map(pkg => pkg.name),
  );
  const unreleasedChanged = unreleased.filter(pkg =>
    directlyChanged.has(pkg.name),
  );
  if (unreleasedChanged.length > 0) {
    return unreleasedChanged.map(
      pkg => `${pkg.name}: changed but has no changeset`,
    );
  }
  return unreleased.map(
    pkg => `${pkg.name}: depends on a changed package but has no changeset`,
  );
}

const base = run('git', [
  'merge-base',
  'HEAD',
  `origin/${process.env.BASE_REF || 'v3'}`,
]);
const changed = changedPackages(base);

if (changed.length === 0) {
  console.log(green('✓ No packages changed.'));
  process.exit(0);
}

const released = plannedReleases(base);
const errors = [
  ...findVersionEdits(changed, base),
  ...(released ? findUncoveredPackages(changed, base, released) : []),
];

if (errors.length > 0) {
  errors.forEach(error => console.error(red(`✗ ${error}`)));
  console.error(
    red(
      '\nAdd changesets with `yarn packages-changeset`; never edit versions by hand.',
    ),
  );
}
if (errors.length > 0 || !released) {
  process.exit(1);
}

console.log(green(`✓ All ${changed.length} changed packages have changesets.`));
