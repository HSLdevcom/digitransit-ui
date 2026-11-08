# Packages

`digitransit-ui` hosts four independently-versioned and independently-published
npm package families, managed as yarn workspaces via [lerna](https://lernajs.io/):

| Family                 | npm scope                 | Packages directory                   | Entry point                                                 | Build step                                  |
| ----------------------- | -------------------------- | ------------------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| `digitransit-component` | `@digitransit-component/*` | `packages/digitransit-component/*`    | `src/index.js`                                                | [Vite](https://vite.dev) (compiles JSX)        |
| `digitransit-search-util` | `@digitransit-search-util/*` | `packages/digitransit-search-util/*` | `index.js` (except `digitransit-search-util-query-utils`, which has a build step and uses `src/index.js`) | none, except `query-utils` (relay-compiler + Vite) |
| `digitransit-store`     | `@digitransit-store/*`     | `packages/digitransit-store/*`        | `src/index.js`                                                | Vite (no JSX)                                 |
| `digitransit-util`      | `@digitransit-util/*`      | `packages/digitransit-util/*`         | `index.js`                                                    | none                                          |

The main app consumes `component`/`store` and query-utils via their built
output — a single ESM file, `lib/index.js` (`"main"`/`exports`), plus
`lib/index.css` for packages with styles — and the other `search-util`
packages and `util` via raw source. There is no CommonJS build. The output is for bundlers: Node can't
load it directly, since it imports `index.css` and extensionless
subpaths such as `lodash/sortBy`. Treat these packages like
semi-external dependencies: changes to their public API should bump their
version (see [Publishing](#publishing)) the same way a change to a real npm
dependency would.

### Search services contract

The `autosuggest` and `autosuggest-panel` components retain the public
`searchContext` prop, which accepts framework-independent search services,
not a React context. The app names that object `searchServices` and passes
it as `searchContext={searchServices}`, leaving package implementations
and their public API unchanged.

The search utility's positional argument order and the nested `context`
passed to service callbacks are unchanged. The app's React `SearchProvider`
and `useSearchContext` API remains separate from this service contract.

## How to Contribute

- Most work happens inside a package directory, `packages/digitransit-<family>/<module>`
  (npm name: `@digitransit-<family>/digitransit-<family>-<module>`).
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
packages/digitransit-<family>/<module>
│   package.json
│   vite.config.js
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
  [Dependency classification](#dependency-classification)); only
  package-specific build tooling goes under `devDependencies` (shared tooling
  comes from the root). Buildable packages also declare the private
  `@digitransit-ui/vite-config` as a `devDependency`.
- `vite.config.js` — calls the shared
  [build config](#shared-build-config) with the package's directory,
  `defineLibraryConfig(import.meta.dirname)` (buildable packages only; not
  published, since `files` whitelists the published content).
- `README.md` — generated, do not hand-edit (see below).
- `LICENSE-*.txt` — copied from the repository root, do not hand-edit.

## Creating a New Module

There's no scaffolding script (the old per-family `create-new-module`
scripts were removed — they generated stale, webpack-based tooling).
Instead:

1. Copy the nearest existing sibling package as a starting point, e.g.:
   ```sh
   $ cp -r packages/digitransit-component/icon \
          packages/digitransit-component/<name>
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
   `packages/digitransit-<family>/*` directory — nothing to add there).
6. Generate its README: run `yarn packages-docs` from the repo
   root, or `yarn docs` from inside the new package's directory (see
   [Documentation](#documentation-readme-generation)).
7. Add tests to CI simply by existing — `yarn packages-test` (part
   of `yarn test-unit`) discovers every package in every family
   automatically via Vitest's `include` glob
   (`packages/digitransit-<family>/*/test.js`).

## Testing

Tests run on [Vitest](https://vitest.dev), configured from a single root
`vitest.config.js` (one `test.projects` entry per family, plus one for the
main app suite — see `docs/Tests.md`). `component`
runs under a jsdom environment, configured entirely in `vitest.config.js`
(no setup file): `environmentOptions.jsdom.html` seeds a persistent
`<div id="app">` for `@hsl-fi/modal`'s `appElement` prop, and `globals: true`
makes `afterEach` a real global, which is all RTL's own automatic
`cleanup()` needs to fire after each test. The other three families run
under plain Node. `component`'s real, un-stubbed ESM `@hsl-fi/*` peer
dependencies (and their own `@radix-ui`/`@floating-ui` dependencies) ship
extensionless `react/jsx-runtime` imports that Node's own resolver can't
match; `component`'s project config forces those through Vite's own (more
lenient) resolver instead (`server.deps.inline`), with a small plugin
unwrapping the handful of `@hsl-fi/*` packages that need a manual
CJS/ESM default-export unwrap.

Run everything from the repository root:

```sh
$ yarn test-unit
```

Or just the packages (all four families in one run):

```sh
$ yarn packages-test
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
$ yarn packages-translations-check  # verify only, wired into `yarn lint`
$ yarn packages-translations-fix    # sort in place, wired into `yarn format`
```

Both modes also flag any key that isn't present in every locale of a file —
a missing translation, or a typo'd key duplicating another with a different
spelling. That mismatch is never auto-fixed (there's no way to guess the
correct key or translation), so `--fix` still exits non-zero if any remain;
resolve those by hand in the package's `translations.js`.

## Documentation (README generation)

Every package's `README.md` is generated from its JSDoc by
[`documentation.js`](https://documentation.js.org/), via the single shared
`scripts/packages/generate-readmes.js` script. **If you find an
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
$ yarn packages-docs
```

CI enforces this: the `check-readmes` job in `.github/workflows/dev-pipeline.yml`
regenerates every family and fails the build if that produces any diff
against what's committed — so a PR that changes JSDoc without regenerating
its README (or one that only hand-edits a README) won't merge.

## Publishing

```sh
$ yarn packages-publish      # interactive, for local/manual use
$ yarn packages-publish-ci   # non-interactive (-y), used by CI
```

Both run `lerna publish from-package --no-git-tag-version --no-push`;
the only difference is CI's `-y` to skip lerna's confirmation prompt.

Versioning is independent per package (`lerna.json`'s `"version": "independent"`)
and bumped manually:

```sh
$ yarn packages-version-bump   # git fetch --tags && lerna version --include-merged-tags
```

`lerna version` pushes the version-bump commit and its tags to the git
remote by default; this is intentional here so release tags actually reach
GitHub. `git fetch --tags` first, plus `--include-merged-tags`, keep
independent-mode change detection (which package changed since its last
release tag) reliable even when local tags are stale or only exist on
another branch pending merge.

`yarn packages-version-check` then verifies every internal
`@digitransit-*` dependency range across all four families is satisfied by
the versions actually present — this runs in CI on every push/PR.

### Schema changes

`digitransit-search-util-query-utils` ships `schema.graphql` in its build, so
the schema is a private package (`packages/private/schema`; `private/`
holds the unpublished packages) that query-utils lists as a
`devDependency`. The root app's relay-compiler and eslint read the same file. This lets change detection see schema edits: after changing
the schema, bump both the schema package and query-utils.
`packages-version-bump` does this, and
`packages-version-check` enforces it.

### Changelogs

`lerna.json`'s `command.publish.conventionalCommits` is deliberately `false`
— changelog generation is **not** automated, and there's no commitlint
enforcing commit message format. Don't enable either; this project's commit
history doesn't follow the Conventional Commits format the tooling expects.

## Dependency Classification

When adding an import to a package's `src/index.js`/`index.js`, classify it
in `package.json` as:

- **`dependencies`** — a real runtime dependency that this package should
  pull in on its own (e.g. `lodash`, `downshift`). The build keeps it
  external like a peer (it isn't bundled), so the consumer installs and
  dedupes it. Import CommonJS dependencies by name
  (`import { useScrollLock } from '@hsl-fi/hooks'`): a default import of a
  CJS module without a `default` export is `undefined` in the app.
- **`peerDependencies`** — anything the *host application* is expected to
  already provide a single shared instance of. This includes `react`,
  `react-dom`, and **every `@hsl-fi/*` package** — regardless of whether it's
  imported directly or only used in an SCSS `@import` (e.g. `@hsl-fi/sass`).
  The one exception is `@hsl-fi/hooks`, a stateless helper with no peers of
  its own, which `autosuggest` keeps as a plain `dependency`.
  Use a caret range of the version the root `package.json` installs (e.g.
  `"^2.5.1"` for a root `"2.5.1"`), never an exact or `~` pin; a stale/wrong
  peer range (too narrow, or naming a major version the host doesn't ship) is
  a bug even if it happens to install locally. E.g. `react` mirrors the
  root's range exactly (`^18.3.1`): the bundles use the automatic JSX runtime
  and are only ever tested against that version.
- **`devDependencies`** — anything needed only to build, test, or generate
  docs for the package itself (e.g. `babel-plugin-relay` for
  `query-utils`'s own relay-compiler step) but that the published bundle
  never needs at runtime. Test tooling shared across packages (`vitest`,
  `@testing-library/*`, `react-dom`, ...) is *not* repeated here: tests run
  through the root Vitest config and resolve it from the root
  `devDependencies`. Package scripts call such root tooling via
  `yarn run -T <bin>` (e.g. `yarn run -T vitest`), since Yarn won't run a
  binary the workspace doesn't declare itself. The `build` script calls Vite
  by path instead (`node $PROJECT_CWD/node_modules/vite/bin/vite.js build`;
  Yarn sets `PROJECT_CWD` to the repo root), which saves a Yarn process per
  package. Packages have no `watch` script: `yarn packages-watch`
  (`scripts/packages/watch.js`) watches all of them from one process.

These rules (for `dependencies`/`peerDependencies`) are enforced by
`yarn packages-dependencies-check`, part of `yarn lint`.

## CSS Modules

Package stylesheets are CSS Modules named `*.module.scss`, compiled with Sass
and [Lightning CSS](https://lightningcss.dev), which also adds the vendor
prefixes the root `browserslist` needs. Scoped class names look like
`digitransit-component-control-panel_icon-container_7YhxCG`: the unscoped
package name, the local name and a hash of the file's path under
`packages/` (the build's Vite `root`), so packages sharing a relative path
such as `src/helpers/styles.module.scss` never collide. Keep `[local]` in
the pattern: the app matches some class names by substring (e.g.
`[class*="mobile-modal"]`).

Mark global selectors with the function form, `:global(.x)`; Lightning CSS
doesn't support the `:global .x` mode switch. Import packages without `~`
(`@import '@hsl-fi/sass/colors'`); the build only aliases `~` because
`@hsl-fi/sass` uses it internally.

### Shipping the CSS

A package with styles emits `lib/index.css`, and its `lib/index.js` starts
with `import './index.css'`. The consuming bundler resolves that import, so
the CSS lands in its normal CSS output with no runtime `<style>` injection.
Such packages declare `"sideEffects": ["**/*.css"]` and export
`./index.css`; packages without styles declare `"sideEffects": false`. The
build fails if a package's styles and its `sideEffects` don't match, since
without the declaration the bundler drops the CSS import.

## Shared build config

`packages/private/vite-config` (`@digitransit-ui/vite-config`, private) holds
the [Vite library mode](https://vite.dev/guide/build#library-mode) config
that builds every `component`/`store` package and query-utils. Each of them
has a `vite.config.js` that calls `defineLibraryConfig(import.meta.dirname)`,
so `vite build` gives the same output from any directory (e.g.
`vite build --config packages/<family>/<package>/vite.config.js`). A package
can extend it locally with `mergeConfig`, as query-utils does to ship
`lib/schema/schema.graphql`.

The config builds `src/index.js(x)` into unminified ESM with source maps,
keeps every `dependencies` and `peerDependencies` entry external, and targets
the root `browserslist` (JS via `browserslist-to-esbuild`, CSS via Lightning
CSS). JSX goes through `@vitejs/plugin-react` (Oxc, always production JSX,
whatever `NODE_ENV` is), SVG imports through
`vite-plugin-svgr`, and Relay `graphql` templates through Babel's relay
plugin (`@digitransit-ui/vite-config/relay`, also used by the root
`vitest.config.js`).

The Vite tooling itself is owned by the root `devDependencies` (see
[Dependency classification](#dependency-classification)), so the config
package declares none. Because it is a `devDependency` of every buildable
package, changing it requires bumping all of them (`packages-version-check`
enforces this). The root `babel.config.cjs` is unrelated: it only serves
tooling (eslint parser, Jest e2e).

## Build Caching

`nx.json`'s `build` target `inputs` include `^default`, so editing the shared
build config invalidates the Nx build cache of every package depending on it.

## Deprecated

Packages are marked deprecated via a `@deprecated` JSDoc tag (which also
shows up in the generated `README.md`) and a `"deprecated"` field in
`package.json` (which npm surfaces on install/publish). Don't add new code
to them, and don't add any new dependents.

### Removed from the repository

Their published versions remain on npm.

- **`@digitransit-component/digitransit-component`** — this family's
  meta-package, re-exporting every sibling component. No call site in
  `app/**` used it; every consumer imports the specific
  `@digitransit-component/digitransit-component-*` sub-package it needs
  directly.
- **`@digitransit-util/digitransit-util`** — this family's equivalent
  meta-package. Same reasoning; import the specific
  `@digitransit-util/digitransit-util-*` sub-package instead.
- **`@digitransit-component/digitransit-component-abtesting`** — never
  adopted, unused.
- **`@digitransit-component/digitransit-component-traffic-now-link`** — no
  longer maintained or used.
- **`@digitransit-store/digitransit-store-common-functions`** — no real
  consumers.
- **`@digitransit-util/digitransit-util-route-pattern-option-text`** — no
  longer used by the app; route pattern option texts are built in
  `app/component/routepage/` instead.
- **`@digitransit-search-util/digitransit-search-util-execute-search-immidiate`**
  — renamed due to a spelling fix; use
  `@digitransit-search-util/digitransit-search-util-execute-search-immediate`
  instead.
