#!/usr/bin/env node

/**
 * Rebuilds every buildable package (those with a `@digitransit-ui/vite-config`
 * devDependency) on change, with one Vite watcher per package in this single
 * process, so Vite and its plugins load once. Run by `yarn packages-watch`.
 */
import fs from 'fs';
import path from 'path';
import { build, createLogger } from 'vite';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const packagesDir = path.join(repoRoot, 'packages');

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

/** Directories of the workspace packages built with the shared Vite config. */
function findBuildablePackages() {
  const { workspaces } = readJson(path.join(repoRoot, 'package.json'));
  return workspaces
    .flatMap(pattern =>
      fs.globSync(path.join(pattern, 'package.json'), { cwd: repoRoot }),
    )
    .map(packageJsonPath => path.join(repoRoot, path.dirname(packageJsonPath)))
    .filter(
      directory =>
        readJson(path.join(directory, 'package.json')).devDependencies?.[
          '@digitransit-ui/vite-config'
        ],
    )
    .sort();
}

/** Vite's logger with warnings and errors labelled with the package. */
function createPackageLogger(label) {
  const logger = createLogger('warn', { allowClearScreen: false });
  const labelled = log => (msg, options) => log(`[${label}] ${msg}`, options);
  return {
    ...logger,
    warn: labelled(logger.warn),
    warnOnce: labelled(logger.warnOnce),
    error: labelled(logger.error),
  };
}

/**
 * Starts watching one package. Resolves with the watcher and a promise that
 * settles when its first build ends.
 */
async function watchPackage(directory) {
  const label = path.relative(packagesDir, directory);
  const watcher = await build({
    configFile: path.join(directory, 'vite.config.js'),
    customLogger: createPackageLogger(label),
    // Also silences the per-build progress and file size report.
    logLevel: 'warn',
    clearScreen: false,
    build: { watch: {} },
  });
  let firstBuild = true;
  const firstBuildEnd = new Promise(resolve => {
    watcher.on('event', event => {
      if (event.code === 'BUNDLE_END' || event.code === 'ERROR') {
        if (!firstBuild && event.code === 'BUNDLE_END') {
          console.log(`[${label}] built in ${event.duration} ms`);
        }
        firstBuild = false;
        resolve();
      }
    });
  });
  return { watcher, firstBuildEnd };
}

const start = Date.now();
const packages = await Promise.all(findBuildablePackages().map(watchPackage));
await Promise.all(packages.map(({ firstBuildEnd }) => firstBuildEnd));
console.log(
  `Watching ${packages.length} packages (built in ${Date.now() - start} ms)`,
);

async function shutdown() {
  await Promise.all(packages.map(({ watcher }) => watcher.close()));
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
