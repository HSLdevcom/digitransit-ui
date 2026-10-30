#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { build, formats } from 'documentation';

// Shared replacement for the 4 near-identical
// packages/digitransit-{component,search-util,store,util}/scripts/generate-readmes
// scripts. `documentation`'s named exports import cleanly under native ESM
// (unlike the Rollup-UMD .cjs artifacts built for component/store packages),
// so no CJS-interop workaround is needed here.
const repoRoot = path.resolve(import.meta.dirname, '..', '..');

function readPackageJson(packageJsonPath) {
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

// Most packages keep a flat index.js; component/store packages (plus the
// one search-util package with a build step, digitransit-search-util-query-
// utils) keep their source under src/index.js(x) instead - .jsx for the
// packages that actually contain JSX, plain .js otherwise.
function findEntryPoint(directory) {
  const candidates = ['src/index.js', 'src/index.jsx', 'index.js', 'index.jsx'];
  const found = candidates
    .map(candidate => path.join(directory, candidate))
    .find(fullPath => fs.existsSync(fullPath));
  return found || path.join(directory, 'index.js');
}

// Running from inside a single package's directory (every per-package
// "docs" script does this) regenerates just that package; running from
// anywhere else (e.g. the repo root, via `yarn packages-docs`)
// regenerates every package in every family.
function findPackagePaths() {
  const cwdPackageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(cwdPackageJsonPath)) {
    const { name } = readPackageJson(cwdPackageJsonPath);
    if (name && name.startsWith('@digitransit-')) {
      return [cwdPackageJsonPath];
    }
  }

  const packagesRoot = path.join(repoRoot, 'packages');
  return fs
    .readdirSync(packagesRoot, { withFileTypes: true })
    .filter(
      entry => entry.isDirectory() && entry.name.startsWith('digitransit-'),
    )
    .flatMap(familyEntry => {
      const packagesDir = path.join(packagesRoot, familyEntry.name);
      return fs
        .readdirSync(packagesDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => path.join(packagesDir, entry.name, 'package.json'))
        .filter(packageJsonPath => fs.existsSync(packageJsonPath));
    });
}

function installationSection(name) {
  return `---

This module is part of the Digitransit-ui project. It is maintained in the
[HSLdevcom/digitransit-ui](https://github.com/HSLdevcom/digitransit-ui) repository, where you can create
PRs and issues.

### Installation

Install this module individually:

\`\`\`sh
$ npm install ${name}
\`\`\`
`;
}

async function generateReadme(packagePath) {
  const directory = path.dirname(packagePath);
  const pckg = readPackageJson(packagePath);
  const { name } = pckg;
  const entryPath = findEntryPoint(directory);

  const res = await build(entryPath, { shallow: true });
  if (res === undefined) {
    throw new Error(`documentation.js produced no output for ${entryPath}`);
  }
  console.log(`Building docs: ${name}`);

  const markdown = await formats.md(res);
  const readme = `# ${name}\n\n${markdown}${installationSection(name)}`;
  fs.writeFileSync(path.join(directory, 'README.md'), readme);
}

async function main() {
  const packagePaths = findPackagePaths();

  for (let i = 0; i < packagePaths.length; i++) {
    const packagePath = packagePaths[i];
    try {
      // eslint-disable-next-line no-await-in-loop
      await generateReadme(packagePath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to generate README for ${packagePath}: ${message}`);
      process.exitCode = 1;
    }
  }
}

main();
