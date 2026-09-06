# Workspace Packages

`digitransit-ui` hosts four independently-versioned and independently-published
npm package families, managed as yarn workspaces via [lerna](https://lernajs.io/):

| Family                 | npm scope                 | Packages directory                   | Entry point                                                 | Build step                                  |
| ----------------------- | -------------------------- | ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| `digitransit-component` | `@digitransit-component/*` | `digitransit-component/packages/*`    | `src/index.js`                                                | [Rollup](https://rollupjs.org) (compiles JSX) |
| `digitransit-search-util` | `@digitransit-search-util/*` | `digitransit-search-util/packages/*` | `index.js` (except `digitransit-search-util-query-utils`, which has a build step and uses `src/index.js`) | none, except `query-utils` (relay-compiler)  |
| `digitransit-store`     | `@digitransit-store/*`     | `digitransit-store/packages/*`        | `src/index.js`                                                | Rollup (no JSX)                              |
| `digitransit-util`      | `@digitransit-util/*`      | `digitransit-util/packages/*`         | `index.js`                                                    | none                                          |

The main app consumes `component`/`store` via their built `lib/index.cjs`
(resolved through each package's `"main"` field) and `search-util`/`util` via
raw source, using webpack's native ESM support. Treat these packages like
semi-external dependencies: changes to their public API should bump their
version (see [Publishing](#publishing)) the same way a change to a real npm
dependency would.

## How to Contribute

- Most work happens inside a family's `packages/<family>-<module>` directory.
- If you'd like to propose a new module or feature, open an issue first.
- Always include tests, using [Vitest](https://vitest.dev). Component
  packages use
  [`@testing-library/react`](https://testing-library.com/docs/react-testing-library/intro/)
  (`render`, `screen`, `fireEvent`); every other family uses Vitest's
  built-in `expect` against real input/output pairs — no placeholders, no
  commented-out tests.
- Keep modules small and focused (one exported component/function per
  package) and avoid large dependencies.
- `README.md` files are generated from source JSDoc — **never edit a
  package's `README.md` directly**; see [Documentation](#documentation-readme-generation).
- Before submitting, run `yarn lint` and `yarn test-unit` from the repo root.

## Code Style

At the repository root:

```sh
$ yarn lint
```

Runs `eslint`, `prettier` (for `.scss`), and `stylelint`. Follow the
[Airbnb JavaScript style guide](https://github.com/airbnb/javascript), which
the eslint config is based on.

## Module Structure

A `component`/`store` package looks like:

```
digitransit-<family>-<module>
│   package.json
│   README.md
│   test.js
│   LICENSE-AGPL.txt
│   LICENSE-EUPL.txt
└── src
    └── index.js
```

A `search-util`/`util` package is the same, but flat (no build step, no
`src/` directory — `index.js` sits at the package root next to `test.js`).

- `src/index.js` / `index.js` — the module's implementation, documented with
  [JSDoc](https://jsdoc.app/). This JSDoc is the *only* source of truth for
  the generated `README.md` — write real descriptions, `@param`/`@returns`,
  and an `@example`, not just type annotations.
- `test.js` — real, executable [Vitest](https://vitest.dev) (and, for
  `component`, RTL) tests, run against raw source (`src/index.js`/
  `index.js`) rather than a built artifact — `component`/`store` packages
  need no `pretest: yarn build` step just to test. `component` tests use
  literal JSX.
- `package.json` — runtime imports go under `dependencies`; anything the
  *host app* must also provide goes under `peerDependencies` instead (see
  [Dependency classification](#dependency-classification)); build/compile-only
  tooling goes under `devDependencies`.
- `README.md` — generated, do not hand-edit (see below).
- `LICENSE-*.txt` — copied from the repository root, do not hand-edit.

## Creating a New Module

There's no scaffolding script (the old per-family `create-new-module`
scripts were removed — they generated stale, webpack-based tooling that no
package has actually used since the migration to Rollup). Instead:

1. Copy the nearest existing sibling package as a starting point, e.g.:
   ```sh
   $ cp -r digitransit-component/packages/digitransit-component-icon \
          digitransit-component/packages/digitransit-component-<name>
   ```
2. In the new `package.json`: rename `"name"`, reset `"version"` to `"0.0.1"`,
   update `"description"`, and clear out anything the copied package needed
   that yours doesn't (extra `dependencies`/`peerDependencies`).
3. Delete any build output that came along (`lib/`) — it's gitignored and
   regenerated by `yarn build`.
4. Replace `src/index.js` (or `index.js`) with your implementation, and
   `test.js` with real tests for it.
5. Run `yarn install` from the repo root so the workspace picks up the new
   package (the root `package.json`'s `workspaces` globs already cover any
   `digitransit-<family>/packages/*` directory — nothing to add there).
6. Generate its README: run `yarn workspace-packages-docs` from the repo
   root, or `yarn docs` from inside the new package's directory (see
   [Documentation](#documentation-readme-generation)).
7. Add tests to CI simply by existing — `yarn test-unit` (all projects) and
   `yarn workspace-packages-test` (`--project '!app'`, packages only) both
   discover every package in every family automatically via Vitest's `include`
   glob (`digitransit-<family>/packages/*/test.js`).

## Testing

Tests run on [Vitest](https://vitest.dev), configured from a single root
`config/vitest.config.js` (one `test.projects` entry per family, plus an
`app` project for the main app suite under `test/unit/**` —
`yarn test-unit:app`, while `yarn workspace-packages-test` runs the families
with `--project '!app'`). `component`
runs under a jsdom environment, configured entirely in `vitest.config.js`
(no setup file): `environmentOptions.jsdom.html` seeds a persistent
`<div id="app">` for `@hsl-fi/modal`'s `appElement` prop, and `globals: true`
makes `afterEach` a real global, which is all RTL's own automatic
`cleanup()` needs to fire after each test. The other three families run
under plain Node. `component` also loads
`config/vitest.jsx-runtime-loader.mjs`, a Node ESM loader hook (wired in via
`NODE_OPTIONS`, not a Vitest config option) that patches the extensionless
`react/jsx-runtime` import and stubs `.css`/`.scss` — both needed for real,
un-stubbed ESM `@hsl-fi/*` peer dependencies, which Node resolves natively
rather than through Vite.

Run everything from the repository root:

```sh
$ yarn test-unit
```

Or just the workspace packages (all four families in one run):

```sh
$ yarn workspace-packages-test
```

Or a single package, from inside its own directory:

```sh
$ yarn test
```

## Translations

Some `digitransit-component` packages ship their own i18next translation
bundle (`src/helpers/translations.js` or `src/utils/translations.js`) — one
file per package holding every locale, each nested under a `translation`
namespace, consumed by a package-local `i18n.js` instance. This is a
different shape from `app/translations/*.js` (one locale per file, no
namespace), so it has its own tooling, separate from the root
`sort-translations` script:

```sh
$ yarn workspace-packages-translations-check  # verify only, wired into `yarn lint`
$ yarn workspace-packages-translations-fix    # sort in place, wired into `yarn format`
```

Both modes also flag any key that isn't present in every locale of a file —
a missing translation, or a typo'd key duplicating another with a different
spelling. That mismatch is never auto-fixed (there's no way to guess the
correct key or translation), so `--fix` still exits non-zero if any remain;
resolve those by hand in the package's `translations.js`.

## Documentation (README generation)

Every package's `README.md` is generated from its JSDoc by
[`documentation.js`](https://documentation.js.org/), via the single shared
`scripts/workspace-packages/generate-readmes.mjs` script. **If you find an
error in a README, fix the source JSDoc and regenerate — never hand-edit
the `README.md` file.** A hand-edit will silently disappear the next time
anyone regenerates it.

The script needs no family/package argument — it works out what to
regenerate from where it's run: from inside a single package's directory it
regenerates just that package; from anywhere else (e.g. the repository
root) it discovers and regenerates every package in every family.

```sh
# regenerate one package's README (run from inside the package's directory)
$ yarn docs

# regenerate every package, in every family (run from the repository root)
$ yarn workspace-packages-docs
```

Each family's meta-package (`@digitransit-component/digitransit-component`,
`@digitransit-util/digitransit-util` — the ones that re-export every
sibling in the family) gets a README too, generated the same way;
`search-util` and `store` don't have a meta-package, so their packages'
READMEs don't mention installing one.

CI enforces this: the `check-readmes` job in `.github/workflows/dev-pipeline.yml`
regenerates every family and fails the build if that produces any diff
against what's committed — so a PR that changes JSDoc without regenerating
its README (or one that only hand-edits a README) won't merge.

## Publishing

```sh
$ yarn workspace-packages-publish      # interactive, for local/manual use
$ yarn workspace-packages-publish-ci   # non-interactive (-y), used by CI
```

Both run `lerna publish from-package --no-git-tag-version --no-push`;
the only difference is CI's `-y` to skip lerna's confirmation prompt.

Versioning is independent per package (`lerna.json`'s `"version": "independent"`)
and bumped manually:

```sh
$ yarn workspace-packages-version-bump   # git fetch --tags && lerna version --no-push --include-merged-tags
```

`--no-push` because `lerna version` pushes the version-bump commit and its
tags to the git remote by default — this script should only touch the local
checkout. `git fetch --tags` first, plus `--include-merged-tags`, keep
independent-mode change detection (which package changed since its last
release tag) reliable even when local tags are stale or only exist on
another branch pending merge.

`yarn workspace-packages-version-check` then verifies every internal
`@digitransit-*` dependency range across all four families is satisfied by
the versions actually present — this runs in CI on every push/PR.

### Changelogs

`lerna.json`'s `command.publish.conventionalCommits` is deliberately `false`
— changelog generation is **not** automated, and there's no commitlint
enforcing commit message format. Don't enable either; this project's commit
history doesn't follow the Conventional Commits format the tooling expects.

## Dependency Classification

When adding an import to a package's `src/index.js`/`index.js`, classify it
in `package.json` as:

- **`dependencies`** — a real runtime dependency that this package should
  pull in on its own (e.g. `lodash`, `downshift`).
- **`peerDependencies`** — anything the *host application* is expected to
  already provide a single shared instance of. This includes `react`,
  `react-dom`, and **every `@hsl-fi/*` package** — regardless of whether it's
  imported directly or only used in an SCSS `@import` (e.g. `@hsl-fi/sass`).
  Keep the version range in sync with what the root `package.json` actually
  installs; a stale/wrong peer range (too narrow, or naming a major version
  the host doesn't ship) is a bug even if it happens to install locally.
- **`devDependencies`** — anything needed only to build, test, or generate
  docs for the package itself (e.g. `babel-plugin-relay` for
  `query-utils`'s own relay-compiler step) but that the published bundle
  never needs at runtime.
