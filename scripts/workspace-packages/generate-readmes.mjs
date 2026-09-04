#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';
import { build, formats } from 'documentation';

// Shared replacement for the 4 near-identical
// digitransit-{component,search-util,store,util}/scripts/generate-readmes
// scripts. `documentation`'s named exports import cleanly under native ESM
// (unlike the Rollup-UMD .cjs artifacts built for component/store packages),
// so no CJS-interop workaround is needed here.
const FAMILIES = {
  component: {
    dirName: 'digitransit-component',
    metaPackage: '@digitransit-component/digitransit-component',
    kind: 'a class',
  },
  'search-util': {
    dirName: 'digitransit-search-util',
    metaPackage: '@digitransit-search-util/digitransit-search-util',
    kind: 'a function',
  },
  store: {
    dirName: 'digitransit-store',
    metaPackage: '@digitransit-store/digitransit-store',
    kind: 'a function',
  },
  util: {
    dirName: 'digitransit-util',
    metaPackage: '@digitransit-util/digitransit-util',
    kind: 'a function',
  },
};

const repoRoot = path.resolve(import.meta.dirname, '..', '..');

// Most packages keep a flat index.js; component/store packages (plus the
// one search-util package with a build step, digitransit-search-util-query-
// utils) keep their source under src/index.js instead.
function findEntryPoint(directory) {
  const withSrc = path.join(directory, 'src', 'index.js');
  if (fs.existsSync(withSrc)) {
    return withSrc;
  }
  return path.join(directory, 'index.js');
}

// Running from inside a single package's directory regenerates just that
// package; running from anywhere else (e.g. the repo root, via `yarn
// digitransit-<family>-docs`) regenerates every package in the family.
function findPackagePaths(family) {
  const packagesDir = path.join(repoRoot, family.dirName, 'packages');
  const currentFolder = path.basename(process.cwd());
  if (currentFolder.startsWith(`${family.dirName}-`)) {
    return [path.join(process.cwd(), 'package.json')];
  }
  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter(
      entry =>
        entry.isDirectory() && entry.name.startsWith(`${family.dirName}-`),
    )
    .map(entry => path.join(packagesDir, entry.name, 'package.json'));
}

async function generateReadme(
  packagePath,
  familyName,
  family,
  installationTemplate,
) {
  const directory = path.dirname(packagePath);
  const pckg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const { name } = pckg;
  const entryPath = findEntryPoint(directory);

  const res = await build(entryPath, { shallow: true });
  if (res === undefined) {
    throw new Error(`documentation.js produced no output for ${entryPath}`);
  }
  console.log(`Building docs: ${name}`);

  const markdown = await formats.md(res);
  const installation = installationTemplate
    .replaceAll('{module}', name)
    .replaceAll('{family}', familyName)
    .replaceAll('{familyDir}', family.dirName)
    .replaceAll('{metaPackage}', family.metaPackage)
    .replaceAll('{kind}', family.kind);
  const readme = `# ${name}\n\n${markdown}${installation}`;
  fs.writeFileSync(path.join(directory, 'README.md'), readme);
}

async function main() {
  const familyName = process.argv[2];
  const family = FAMILIES[familyName];
  if (!family) {
    console.error(
      `Usage: node generate-readmes.mjs <${Object.keys(FAMILIES).join('|')}>`,
    );
    process.exitCode = 1;
    return;
  }

  const installationTemplate = fs.readFileSync(
    path.join(import.meta.dirname, 'installation.md'),
    'utf8',
  );
  const packagePaths = findPackagePaths(family);

  for (let i = 0; i < packagePaths.length; i++) {
    const packagePath = packagePaths[i];
    try {
      // eslint-disable-next-line no-await-in-loop
      await generateReadme(
        packagePath,
        familyName,
        family,
        installationTemplate,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to generate README for ${packagePath}: ${message}`);
      process.exitCode = 1;
    }
  }
}

main();
