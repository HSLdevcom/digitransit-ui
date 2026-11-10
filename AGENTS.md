# Digitransit-ui Copilot Instructions

Digitransit-ui is a React (Relay/GraphQL) journey-planning web app used by multiple
regional deployments (HSL, Tampere, Matka/national, etc.), configured via the `CONFIG` env var.

## Code review

When reviewing changes, follow `REVIEW.md`.

## Directory structure

Directories reflect a server/client/shared split (see "Server/client boundary" below) — pick the
right one by *who consumes the code*, not just by convenience.

- `app/` — client-bundle-only React app (React components + route trees):
  - `client/` — browser entry & bootstrap: `client.jsx` (browser entry, farce/found router
    bootstrap, `AppProviders`), `publicPath.js` (extra webpack entry
    modules), `i18n.js`.
  - `routes/` — found + Relay route-tree definitions: `routes.jsx` (front page, top level),
    `routeRoutes.jsx` (route pages), `stopRoutes.jsx` (stop pages); keep the filenames, Relay
    query names are prefixed with them.
  - `assets/` — source art bundled into the client: `images/<theme>/` (logos, favicons,
    illustrations; `default/` holds the fallbacks), `icons/<theme>/` (one `<id>.svg` per icon;
    `default/` has all of them, other themes only overrides — built into sprite sheets by
    `scripts/build/buildSprites.js`, never edit a sprite by hand), plus `assetUrl.js`
    (`getAssetUrl`, resolves config image paths to bundled URLs).
  - `component/` — topic subfolders for larger features: `itinerary/`, `map/`, `stop/`,
    `routepage/`, `nearyou/`, `trafficnow/` (has its own `README.md`), `embedded/`, `visual/`,
    `icon/`, and `__generated__/` (Relay codegen).
  - `data/` — plain (non-React) client-side modules (favourites, position, search) behind the
    providers in `hooks/`; components should use the hooks rather than these directly.
  - `hooks/` — app state as React Context providers + hooks, mounted in `AppProviders`
    (`app/client/client.jsx`). Add new providers there (and to
    `test/unit/helpers/mock-providers.jsx` if tests need it).
  - `translations/` — one file per locale (`fi.js`, `en.js`, `sv.js`, ...); `fi.js` is the source
    of truth, keep sorted via `scripts/sort-translations.js` (`yarn format` runs this), and every
    key must also exist in `en.js`/`sv.js` (enforced by `test/unit/translations.test.js`). Some
    `digitransit-component` packages ship their own i18next translation bundles instead, sorted/
    checked separately via `scripts/packages/sort-translations.js`.
- `server/` — Express server, native-ESM, never bundled: `server.js` (entrypoint: boot-time data
  fetches via `services/`, `.listen()`, graceful shutdown), `app.js` (`createApp()` — builds the
  configured Express app, including the dev-mode `/proxy/` passthrough to webpack-dev-server, no
  `.listen()`, so it's directly testable with supertest), `middleware/` — `shell.js` (renders the
  initial HTML shell — meta tags, config, asset preloads; no React runs server-side, the client
  bundle does all component rendering), `legacyUrlMiddleware.js` (redirects legacy reittiopas-era
  URLs), `services/` — boot-time integrations (`ticketPrices.js`, `geoJsonZones.js`,
  `citybikeSeasons.js`), `html/` — HTML-shell helpers (`assetManifest.js` reads webpack's build
  manifest), `passport-openid-connect/`, and
  `configs/` — `config.js` (server-side config resolution/merging by host header via `BASE_CONFIG`) plus one
  `config.<region>.js` per deployment.
- `utils/` — helper modules split by consumer (see "Server/client boundary" below):
  - `shared/` — used by both server and client, e.g. `constants.js`, `metaUtils.js`,
    `analyticsUtils.js`, `gtfs.js`, `citybikeSeasonUtils.js`. Isomorphic only: a file (or a
    function within a file, e.g. `vehicleRentalUtils.js`'s pure network/config helpers vs. its
    `client/` counterpart's `localStorage`/analytics-touching ones) belongs here only if it's
    safe to run on the server too — no `window`/`document`/`localStorage` access.
  - `server/` — server-only, e.g. `configMerger.js`, `metaUtils.js`, `realtimeUtils.js`,
    `timetableConfigUtils.js` — config-assembly helpers used only by `server/configs/*.js`.
  - `client/` — client-bundle-only, e.g. `localStorage.js`,
    plus its own `__generated__/` for Relay fragments used by utils.
- `test/` — `unit/` (Vitest, mirrors the `app/`/`server/`/`utils/` layout, e.g.
  `test/unit/utils/{shared,server,client}/`, `test/unit/server/configs/`). The CI Docker smoke
  test is `.github/workflows/scripts/docker_smoke_test.sh`.
- `scripts/` — dev helper scripts (`dev.sh`, `sort-translations.js`, `build/contextHelper.js`,
  `generate-schema.js`, `theme/` theme-scaffolding scripts, `packages/` (readme
  generation, version checks, translation sort/check); see `scripts/README.md`).
- `packages/` — Yarn workspaces, consumed by the app but built/versioned independently, so
  treat them like semi-external dependencies (see `docs/Packages.md`):
  - `digitransit-{component,search-util,store,util}/<package>/` — the published packages.
  - `private/` — unpublished: `schema/` (generated `schema.graphql` for relay-compiler and
    graphql-eslint; regenerate with `scripts/generate-schema.js`, don't hand-edit; a devDependency
    of query-utils) and `rollup-config/` (shared rollup/babel build config, re-exported by each
    buildable package's `rollup.config.js`) and `test-utils/` (shared test helpers such as the
    axe a11y check).
  - Peer ranges are caret ranges of the root's version (e.g. `react` `^18.3.1`). Shared
    test/build tooling lives only in the root `devDependencies`; package scripts call it via
    `yarn run -T <bin>`, except rollup in `build`/`watch`, which is called by path to save a Yarn
    process per watcher. See "Dependency Classification" in `docs/Packages.md`.
  - Never bump package versions manually; the `packages-version-bump` script is run after
    a PR is approved but before merging by the author.
- `styles/` — shared styles: `main.scss` entry, `abstracts/` (no CSS output), `base/` (global CSS),
  `themes/<theme>/theme.scss` (custom property values). See "Styles" below.
- `static/` — static assets, copied to `_static/`.
- `docs/` — architecture/testing/etc. docs; **treat as potentially stale** — when a change
  affects what a `docs/*` file describes, update that doc in the same change.

## Setup & build (see `docs/Installation.md`)

- Requires the Node version from `engines.node` and the Yarn version from `packageManager` in
  `package.json` (`corepack enable`). Also needs `watchman`.
- `yarn install` — installs deps.
- `yarn run dev` — dev server at http://localhost:8080 (webpack-dev-server + `node --watch` server +
  relay-watch + component watch, run in parallel via one script). Runs against mock/no API keys.
- `API_TYPE=development|production|local API_SUBSCRIPTION_TOKEN=<key> yarn run dev` — run the dev
  server against real APIs (map tiles, geocoding, etc.), handled inside `scripts/dev.sh`:
  - `development` (default) — `dev-api.digitransit.fi`.
  - `production` — `api.digitransit.fi`.
  - `local` — local OTP at `http://localhost:9080/otp/`.
  - `API_SUBSCRIPTION_TOKEN` is required for full functionality in all three modes.
- `yarn run build` then `yarn run start` — production build/run. Use `CONFIG=hsl` (or `tampere`,
  `matka`, etc., see `server/configs/config.*.js`) to select a regional config, and
  `API_URL=...` to point at a different OTP/geocoding backend.
- If the OTP GraphQL schema changes: `node scripts/generate-schema.js` (regenerates
  `packages/private/schema/schema.graphql`; `relay-compiler` then regenerates the `__generated__/` folders on
  build/dev).

## Docker (see `docs/Docker.md`)

- `.dockerignore` is a default-deny allow-list; add an explicit `!path` line if the image genuinely needs something new.

## Lint & format

- `yarn lint` — eslint (Airbnb config + jsx-a11y + compat + prettier) + `prettier-styles` (scss
  check) + `prettier-icons` (`app/assets/icons/**/*.svg`, via `@prettier/plugin-xml`) + `stylelint`
  + component-package translation parity check + package dependency check
  (`yarn packages-dependencies-check`).
- `yarn format` — auto-fixes: sorts translations (app + component packages), `eslint --fix`,
  prettier styles, prettier icons, stylelint fix.
- `yarn eslint` / `yarn eslint-fix` for JS only.
- Husky git hooks: pre-commit runs `lint-staged` (eslint on staged JS, prettier+stylelint on
  staged scss, prettier on staged icon SVGs) and blocks on unresolved merge-conflict markers; pre-push runs the full
  `yarn run test-unit` suite, so pushes can be slow or rejected if unit tests fail.

## Tests (see `docs/Tests.md`)

- Unit tests (Vitest, files under `test/unit/**/*.test.{js,jsx}`) mirror the source structure where
  the reorg has been applied, e.g. `test/unit/component/...`, `test/unit/hooks/...`,
  `test/unit/data/...`, `test/unit/server/configs/...`,
  `test/unit/utils/{shared,server,client}/...` — a
  `test/unit/util/` (old, singular) directory and some flat `test/unit/*.test.{js,jsx}` files
  remain from before the reorg and don't yet mirror anything. This setup is currently under
  refactoring — verify commands against `package.json` if they seem out of date:
  - For new React component tests, prefer **React Testing Library** and test components from the
    user's perspective rather than relying on implementation details. Use
    `renderWithProviders` / `TestProviders` from `test/unit/helpers/mock-providers.jsx` to supply
    config, intl and context providers.
  - Run all: `yarn test-unit` (**Vitest**, root `vitest.config.js`).
  - Run just the app suite: `yarn test-unit:app` or just the server tests: `yarn test-unit:server`.
  - Run a single test file or test: `yarn test-unit:app <path-substring>` or
    `yarn test-unit:app -t "<describe/it name pattern>"` (`test-unit:server` for server tests).
  - Watch mode: `yarn run test-unit -- --watch`.
- Browser exploration: the Playwright MCP server in `.mcp.json` can drive the app at http://localhost:8080 while
  `yarn run dev` runs. It is not a test runner (see `docs/Tests.md`).
- Accessibility: new or changed components with significant markup get an
  `it('has no accessibility violations')` using `expectNoA11yViolations` from
  `@digitransit-ui/test-utils` (axe-core in jsdom, see `docs/Tests.md`). Allowlist known issues with
  a required `reason` rather than skipping the check.
- Add a concise set of core functionality tests for new features. App-breaking logic should be
  tested, but e.g. checking whether an individual UI element was rendered is not necessary unless
  conditionally rendered to keep the set of tests focused and concise.

## Architecture (see `docs/Architecture.md`, `docs/Navigation.md`)

Data flows into components via two separate mechanisms — know which one a piece of data comes
from before touching it:

- **GraphQL/Relay** — used for anything served by OpenTripPlanner (routes, stops, itineraries).
  Fragments live alongside components/routes and generated artifacts land in a sibling
  `__generated__/` folder, e.g. `app/routes/__generated__` (do not hand-edit generated files; edit
  `.js`/route files and rerun relay-compiler via `yarn dev` or `yarn relay`).
- **React Context + hooks** — everything else (config, app/UI state, favourites, position, ...),
  with providers in `app/hooks/`.

Some components are still split into views and `*Container` components wrapped with Relay HOCs
(`createFragmentContainer` etc.). We are moving away from this: prefer function components that
fetch data and manage state with hooks.

## Server/client boundary

Server code (`server/**`, `utils/server/**`) runs directly in Node (native ESM, no bundler); `app/**`
and `utils/client/**` are bundled by webpack for the browser.

- `server/**` and `utils/server/**` never import `app/**` or `utils/client/**` (and vice versa).
  The server renders only the HTML shell and serializes the merged config onto `window.config`.
- `utils/shared/**` is imported by both sides, so it must be isomorphic and may only import other
  `utils/shared/**` code or external packages.
- `utils/server/**` and `utils/client/**` are single-consumer; keep helpers in the right one.
- Relative imports in `server/**`, `utils/shared/**` and `utils/server/**` must include the file
  extension; everywhere else (`app/**`, `utils/client/**`, tests, `digitransit-*` packages) they
  must not.

## Styles (see `docs/Styles.md`, `docs/Themes.md`)

All themes share `styles/main.scss`; a theme only sets CSS custom properties.

- We're moving to CSS Modules. New component styles go in `Component.module.scss` next to the component
  and are imported by it. Don't add component stylesheets to `styles/main.scss`; the ones there are
  legacy, and its order is their cascade order. Global styles go in `styles/base/`.
- Stylesheets start with a relative `@use '../../styles/abstracts' as *;`. `styles/abstracts/` must not
  emit CSS, and a local variable must not reuse a name it defines.
- Per-theme values: default in `styles/themes/default/theme.scss`, a `$name: var(--name);` wrapper in
  `styles/abstracts/_variables.scss`, overrides in `styles/themes/<theme>/theme.scss`. Values that
  don't vary stay plain Sass variables. `var()` doesn't work in media queries or data URIs.
- Colors JS also needs live in `colors` in the config; CSS reads them with `config('colors.x')`, so don't
  set them again in `theme.scss`.
- Use `abstracts` palette variables instead of hex values, and design tokens such as `--space-fixed-s` and
  `--radius-m` where they exist. An undefined `var()` fails silently, so check that a token exists.
- Layers are `reset, vendor, tokens, theme`, declared in `styles/themes/default/theme.scss`. App CSS
  is unlayered. Avoid `!important`.
- Page-level z-indexes go in `$global-zindex` in `styles/abstracts/_zindex.scss`.
- Before removing a class, check `cx()` keys, HTML strings, lowercased enums, react-select's
  `classNamePrefix`, `@extend`, `class` attributes in SVGs and names libraries add at runtime. Use
  `git grep -nw <name>` and search `_static/js` after a build. See "Removing or changing CSS" in `docs/Styles.md`.
- Icon color differences go in CSS (`fill`, `currentColor`, a custom property). A different shape gets its own
  `app/assets/icons/<theme>/<id>.svg` and `sprites` in the theme's config, not theme classes inside an SVG.
- SCSS under `styles/`, `app/**/*.scss`, `packages/digitransit-component/**/*.scss` must pass
  `prettier --check` and `stylelint`.

## Code conventions

- ES2015+ transpiled with Babel; Airbnb JS/React style guide (`.eslintrc.cjs`) with project
  overrides: prefer object spread over `Object.assign`; `no-console` is an error (except in
  Node-only `server/**`, `utils/server/**`, `scripts/**`); Prettier config
  is `singleQuote: true, trailingComma: 'all', arrowParens: 'avoid'`.
- Keep comments and explanations concise, describing the current state rather than how it was
  reached; prefer one-line comments. Comment only where necessary; document functions with concise JSDoc (`/** ... */`).
- When removing `defaultProps`, use parameter defaults only for valid values; never default to
  `undefined`.
- JSX-containing files use the `.jsx` extension; plain `.js` never contains JSX. For the
  extension-required-vs-forbidden import policy, see "Server/client boundary" above;
  `import/extensions` is not autofixable by `eslint --fix`.
- Always inline default exports (`export default function Foo() {}`), not a separate
  `export default Foo;` at the end of the file.
- Avoid `Component.defaultProps` in function components (deprecated by React, and unsupported for
  function components in newer React versions). Declare defaults via destructuring in the
  function signature instead, e.g. `function Foo({ isMobile = false, children = null })`. This
  applies to new code and to any component touched during refactors; existing untouched
  components may still use `defaultProps` until they're otherwise modified.
- To avoid unnecessary re-renders, define non-primitive default parameter values (objects,
  arrays, functions) as module-level constants instead of inline literals.
- Declare `dependencies`/`devDependencies` in `package.json` files with exact versions (e.g.
  `"2.5.1"`), never `^` or `~`. The only exception is package `peerDependencies`, which
  are caret ranges of the root's version (enforced by `yarn packages-dependencies-check`).
- The project does not enable `eslint-plugin-react-hooks`'s `exhaustive-deps` rule, and top-level
  app values such as `config` (`useConfigContext()`) and provider action helpers (e.g.
  `messageActions`) are set once at app init and never change identity for the app's lifetime.
  It's fine to omit such stable values from `useEffect`/`useCallback`/`useMemo` dependency
  arrays — prefer this over padding dependency arrays with values that never actually change.
- Polyfills are build-time only: `import 'core-js/stable'` in `app/client/client.jsx` plus
  `@babel/preset-env` (`useBuiltIns: 'entry'`) driven by the `browserslist` in `package.json`;
  don't add runtime/UA-based polyfill services. Keep `corejs.version` in `webpack.config.js` (the
  `app/` loader, which ignores the root `babel.config.cjs`) in sync with the installed core-js
  minor.
