#!/usr/bin/env node

/**
 * Checks that every workspace package's package.json declares exactly what
 * its published code imports, following the rules in
 * docs/WorkspacePackages.md ("Dependency Classification"):
 *
 * 1. Every imported package is declared in dependencies/peerDependencies.
 * 2. Every declared dependency/peerDependency is imported, except peers
 *    passed through for a sibling @digitransit-* dependency's own peers
 *    (the deprecated bundle packages).
 * 3. Every peer of a sibling @digitransit-* dependency is passed through,
 *    i.e. declared by the depending package too.
 * 4. Nothing is declared as both a dependency and a peerDependency.
 * 5. Every (non-workspace) peer range is "^<version the root declares>" in
 *    the root's dependencies.
 * 6. @hsl-fi/* packages are peers, except HSL_FI_DEPENDENCY_EXCEPTIONS.
 *
 * "Published code" is the module graph reachable from the package's build
 * entry point via relative JS/JSX/SCSS imports, so tests and test helpers
 * never count. Wired into `yarn lint`.
 */
import fs from 'fs';
import path from 'path';
import { builtinModules } from 'module';
import { parseSync } from '@babel/core';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');

const HSL_FI_DEPENDENCY_EXCEPTIONS = ['@hsl-fi/hooks'];

// Relative imports with any other extension (svg, json, ...) are assets.
const CODE_FILE = /\.(jsx?|scss)$/;

const colorsEnabled = !process.env.NO_COLOR;
const red = text => (colorsEnabled ? `\x1b[31m${text}\x1b[0m` : text);
const green = text => (colorsEnabled ? `\x1b[32m${text}\x1b[0m` : text);

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

// Same candidate order as config/rollup.config.js's build input.
function findEntryPoint(directory) {
  return ['src/index.js', 'src/index.jsx', 'index.js', 'index.jsx']
    .map(candidate => path.join(directory, candidate))
    .find(fullPath => fs.existsSync(fullPath));
}

function resolveRelative(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const { dir, name } = path.parse(base);
  return [
    base,
    ...['.js', '.jsx', '.scss'].map(ext => base + ext),
    path.join(dir, `_${name}.scss`),
    ...['index.js', 'index.jsx'].map(index => path.join(base, index)),
  ].find(
    candidate =>
      CODE_FILE.test(candidate) &&
      fs.existsSync(candidate) &&
      fs.statSync(candidate).isFile(),
  );
}

// `@scope/name/sub/path` -> `@scope/name`, `name/sub` -> `name`.
function packageName(specifier) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

// Collects string sources of import/export declarations, import() and
// require() calls anywhere in the AST.
function collectJsSpecifiers(node, specifiers) {
  if (!node || typeof node.type !== 'string') {
    return;
  }
  if (node.source?.type === 'StringLiteral') {
    specifiers.push(node.source.value);
  }
  if (
    node.type === 'CallExpression' &&
    (node.callee.type === 'Import' ||
      (node.callee.type === 'Identifier' && node.callee.name === 'require')) &&
    node.arguments[0]?.type === 'StringLiteral'
  ) {
    specifiers.push(node.arguments[0].value);
  }
  Object.values(node).forEach(value =>
    (Array.isArray(value) ? value : [value]).forEach(child =>
      collectJsSpecifiers(child, specifiers),
    ),
  );
}

// Returns import specifiers, with SCSS ones normalized to JS conventions:
// `~pkg/...` -> `pkg/...`, anything else -> relative.
function importSpecifiers(file) {
  const source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.scss')) {
    const withoutComments = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    return [...withoutComments.matchAll(/@(?:import|use|forward)\s+([^;]+);/g)]
      .flatMap(([, list]) => [...list.matchAll(/['"]([^'"]+)['"]/g)])
      .map(([, specifier]) => specifier)
      .filter(specifier => !specifier.startsWith('sass:'))
      .map(specifier =>
        specifier.startsWith('~')
          ? specifier.slice(1)
          : `./${specifier.replace(/^\.\//, '')}`,
      );
  }
  const ast = parseSync(source, {
    filename: file,
    configFile: false,
    babelrc: false,
    sourceType: 'module',
    parserOpts: { plugins: ['jsx'] },
  });
  const specifiers = [];
  collectJsSpecifiers(ast.program, specifiers);
  return specifiers;
}

// Walks the module graph from `entry`, returning the imported package names
// and any relative code imports that don't resolve to a file.
function collectImports(entry) {
  const imported = new Set();
  const unresolved = [];
  const visited = new Set();
  const pending = [entry];
  while (pending.length > 0) {
    const file = pending.pop();
    if (!visited.has(file)) {
      visited.add(file);
      importSpecifiers(file).forEach(specifier => {
        if (specifier.startsWith('.')) {
          const resolved = resolveRelative(file, specifier);
          if (resolved) {
            pending.push(resolved);
          } else if (!path.extname(specifier) || CODE_FILE.test(specifier)) {
            unresolved.push(`${specifier} (in ${path.basename(file)})`);
          }
        } else if (
          !specifier.startsWith('node:') &&
          !builtinModules.includes(packageName(specifier))
        ) {
          imported.add(packageName(specifier));
        }
      });
    }
  }
  return { imported, unresolved };
}

// Private workspaces (the schema package) aren't published and have no code.
function findPackages() {
  const { workspaces } = readJson(path.join(repoRoot, 'package.json'));
  return workspaces
    .flatMap(pattern =>
      fs.globSync(path.join(pattern, 'package.json'), { cwd: repoRoot }),
    )
    .map(packageJsonPath => ({
      directory: path.join(repoRoot, path.dirname(packageJsonPath)),
      packageJson: readJson(path.join(repoRoot, packageJsonPath)),
    }))
    .filter(({ packageJson }) => !packageJson.private);
}

function checkPackage(
  { directory, packageJson },
  packagesByName,
  rootVersions,
) {
  const dependencies = packageJson.dependencies || {};
  const peers = packageJson.peerDependencies || {};
  const entry = findEntryPoint(directory);
  if (!entry) {
    return ['has no src/index.js(x) or index.js(x) entry point'];
  }
  const { imported, unresolved } = collectImports(entry);
  const errors = unresolved.map(
    specifier => `can't resolve relative import ${specifier}`,
  );

  const passThroughPeers = new Set(
    Object.keys(dependencies)
      .filter(name => packagesByName.has(name))
      .flatMap(name =>
        Object.keys(packagesByName.get(name).peerDependencies || {}),
      ),
  );

  imported.forEach(name => {
    if (!(name in dependencies) && !(name in peers)) {
      errors.push(`imports "${name}" but doesn't declare it`);
    }
  });

  passThroughPeers.forEach(name => {
    if (!(name in dependencies) && !(name in peers)) {
      errors.push(
        `peerDependency "${name}" of a @digitransit-* dependency must be declared as a peerDependency too`,
      );
    }
  });

  Object.keys(dependencies).forEach(name => {
    if (!imported.has(name)) {
      errors.push(`dependency "${name}" is never imported`);
    }
    if (name in peers) {
      errors.push(`"${name}" is both a dependency and a peerDependency`);
    }
    if (
      name.startsWith('@hsl-fi/') &&
      !HSL_FI_DEPENDENCY_EXCEPTIONS.includes(name)
    ) {
      errors.push(`"${name}" must be a peerDependency, not a dependency`);
    }
  });

  Object.entries(peers).forEach(([name, range]) => {
    if (!imported.has(name) && !passThroughPeers.has(name)) {
      errors.push(`peerDependency "${name}" is never imported`);
    }
    if (range.startsWith('workspace:')) {
      return;
    }
    const rootVersion = rootVersions[name];
    if (!rootVersion) {
      errors.push(
        `peerDependency "${name}" isn't in the root package.json's dependencies`,
      );
      return;
    }
    const expected = `^${rootVersion.replace(/^[\^~]/, '')}`;
    if (range !== expected) {
      errors.push(
        `peerDependency "${name}": "${range}" must be "${expected}" (root: "${rootVersion}")`,
      );
    }
  });

  return errors;
}

// Peers are provided by the app at runtime, so only the root's (non-dev)
// dependencies count.
const rootVersions = readJson(path.join(repoRoot, 'package.json')).dependencies;
const packages = findPackages();
const packagesByName = new Map(
  packages.map(({ packageJson }) => [packageJson.name, packageJson]),
);

let failed = false;
packages.forEach(pkg => {
  checkPackage(pkg, packagesByName, rootVersions).forEach(error => {
    failed = true;
    console.error(red(`✗ ${pkg.packageJson.name}: ${error}`));
  });
});

if (failed) {
  console.error(
    red(
      '\nSee "Dependency Classification" in docs/WorkspacePackages.md for the rules.',
    ),
  );
  process.exit(1);
}

console.log(
  green(
    `✓ All ${packages.length} workspace packages declare their dependencies correctly.`,
  ),
);
