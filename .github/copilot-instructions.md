# Digitransit-ui Copilot Instructions

Digitransit-ui is a React (Flux + Relay/GraphQL) journey-planning web app used by multiple
regional deployments (HSL, Tampere, Matka/national, etc.), configured via the `CONFIG` env var.

## Directory structure

Directories reflect a server/client/shared split (see "Server/client boundary" below) — pick the
right one by *who consumes the code*, not just by convenience.

- `app/` — client-bundle-only React app (Views/Containers/Flux + route trees):
  - `client/` — client entry & top-level client-only modules: `client.jsx` (browser entry,
    farce/found router bootstrap), `app.js` (fluxible app/store wiring), `routes.jsx` /
    `routeRoutes.jsx` / `stopRoutes.jsx` (found + Relay route-tree definitions for the front page,
    route pages, and stop pages), `i18n.js`, `buildInfo.js` (generated build stamp, don't
    hand-edit), `ConfigContext.jsx` (React context provider for config), `images/` (regional logo
    assets).
  - `component/` — topic subfolders for larger features: `itinerary/`, `map/`, `stop/`,
    `routepage/`, `nearyou/`, `trafficnow/` (has its own `README.md`), `embedded/`, `visual/`,
    `icon/`, and `__generated__/` (Relay codegen).
  - `action/` — Flux action creators (one file per domain, e.g. `FavouriteActions.js`).
  - `store/` — Flux stores (one file per domain, mirrors `action/`), plus `sessionStorage.js`
    persistence helper.
  - `hooks/` — shared React hooks; small today but growing, since new code should prefer
    hooks-based state over Flux (see Architecture below).
  - `translations/` — one file per locale (`fi.js`, `en.js`, `sv.js`, ...); `fi.js` is the source
    of truth, keep sorted via `scripts/sort-translations.js` (`yarn format` runs this), and every
    key must also exist in `en.js`/`sv.js` (enforced by `test/unit/translations.test.js`). Some
    `digitransit-component` packages ship their own i18next translation bundles instead, sorted/
    checked separately via `scripts/workspace-packages/sort-translations.js`.
  - `__generated__/` — Relay codegen for the top-level route query definitions, don't hand-edit.
- `server/` — Express SSR server, native-ESM, never bundled: `server.js` (entrypoint),
  `serve.js` (SSR render), `reittiopasParameterMiddleware.js`, `passport-openid-connect/`,
  `proxyTester.js`, and `configs/` — `config.js` (server-side config resolution/merging by host)
  plus one `config.<region>.js` per deployment.
- `utils/` — helper modules split by consumer (see "Server/client boundary" below):
  `shared/` (used by both server and client, e.g. `constants.js`, `meta.js`, `localStorage.js`,
  `analyticsUtils.js`, `gtfs.js`, `citybikeSeasonUtils.js`), `server/` (server-only, e.g.
  `configMerger.js`, `realtimeUtils.js`, `timetableConfigUtils.js` — config-assembly helpers used
  only by `server/configs/*.js`), `client/` (client-bundle-only, the bulk of the old `app/util/`,
  plus its own `__generated__/` for Relay fragments used by utils).
- `test/` — `unit/` (mocha, mirrors the `app/`/`server/`/`utils/` layout, e.g.
  `test/unit/utils/{shared,server,client}/`, `test/unit/server/configs/`) and `e2e/` (Jest +
  Playwright visual tests).
- `scripts/` — dev helper scripts (`dev.sh`, `sort-translations.js`, `build/contextHelper.js`,
  `generate-schema.js`, `theme/` theme-scaffolding scripts, `workspace-packages/` (readme
  generation, version checks, translation sort/check); see `scripts/README.md`).
- `digitransit-component/`, `digitransit-search-util/`, `digitransit-store/`,
  `digitransit-util/` — Yarn workspace packages, built separately (see below).
- `sass/`, `static/` — global styles and static assets.
- `config/` — build tooling config (e.g. rollup).
- `schema/` — generated `schema.graphql` (GraphQL schema consumed by relay-compiler and
  graphql-eslint; regenerate with `scripts/generate-schema.js`, don't hand-edit).
- `docs/` — architecture/testing/etc. docs; **treat as potentially stale** — when a change
  affects what a `docs/*` file describes, update that doc in the same change.

## Setup & build

- Requires the Node version from `engines.node` and the Yarn version from `packageManager` in
  `package.json` (`corepack enable`). Also needs `watchman`.
- `yarn install` — installs deps.
- `yarn run dev` — dev server at http://localhost:8080 (webpack-dev-server + nodemon server +
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
  `schema/schema.graphql`; `relay-compiler` then regenerates `app/__generated__` on build/dev).

## Docker

- `.dockerignore` is a default-deny allow-list; add an explicit `!path` line if the image genuinely needs something new.

## Lint & format

- `yarn lint` — eslint (Airbnb config + jsx-a11y + compat + prettier) + `prettier-styles` (scss
  check) + `stylelint` + component-package translation parity check.
- `yarn format` — auto-fixes: sorts translations (app + component packages), `eslint --fix`,
  prettier styles, stylelint fix.
- `yarn eslint` / `yarn eslint-fix` for JS only.
- Husky git hooks: pre-commit runs `lint-staged` (eslint on staged JS, prettier+stylelint on
  staged scss) and blocks on unresolved merge-conflict markers; pre-push runs the full
  `yarn run test-unit` suite, so pushes can be slow or rejected if unit tests fail.

## Tests

- Unit tests (mocha, files under `test/unit/**/*.test.js`, mirrors the source structure e.g.
  `test/unit/component/...`, `test/unit/store/...`, `test/unit/server/configs/...`,
  `test/unit/utils/{shared,server,client}/...`). This setup is currently under refactoring —
  verify commands against `package.json` if they seem out of date:
  - For new React component tests, prefer **React Testing Library** and test components from the user's perspective rather than relying on implementation details.
  - Run all: `yarn test-unit` (runs app + workspace `store`/`component` package tests).
  - Run just the app suite: `yarn test-unit:app`.
  - Run a single test by name (grep on describe/it or filename stem):
    `yarn test-single -g <pattern>` (this is `test-unit:app -g <pattern>`).
  - Watch mode: `yarn run test-unit -- --watch`.
- E2E/visual tests (Jest + Playwright, config under `test/e2e/jest.config.cjs`), require a prior
  `yarn build`:
  - `CONFIG=hsl yarn test:e2e` (desktop), `MOBILE=TRUE CONFIG=hsl yarn test:e2e` (mobile).
  - Single test: `CONFIG=hsl yarn test:e2e -- FrontPage`.
  - Update snapshots: `CONFIG=hsl yarn test:update-snapshots` (see other
    `test:update-all-*-snapshots` scripts for bulk updates across configs).
- Accessibility: `yarn test-accessibility` (`test/accessibility.sh`).

## Architecture (see `docs/Architecture.md`, `docs/Navigation.md`)

Data flows into components via two separate mechanisms — know which one a piece of data comes
from before touching it:

- **GraphQL/Relay** — used for anything served by OpenTripPlanner (routes, stops, itineraries).
  Fragments live alongside components/routes and generated artifacts land in `app/__generated__`
  (do not hand-edit generated files; edit `.js`/route files and rerun relay-compiler via `yarn dev`
  or `yarn relay`).
- **Flux (fluxible)** — legacy mechanism for everything else (app/UI state, favourites, position,
  search history). Actions in `app/action/*Actions.js`, stores in `app/store/*Store.js`;
  components read store state via `connectToStores` HOCs ("StoreConnectors", see below). Fluxible
  is being phased out and should not be used for new code — use newer hooks-based alternatives
  instead, which many functional components already use to fetch/manage this kind of state
  directly.

Three component categories (naming is meaningful, not just style — follow it for new files):

- **Views** — stateless, props-in/JSX-out, only render DOM elements or other Views. No store or
  relay references, no internal state.
- **RelayConnectors** — wrap a pure view with a Relay container/fragment. Convention: default
  export is the pure view, named export is `<View>RelayConnector` (or split into two files); the
  view itself should fall back to rendering without `props.relay` if relay data isn't present.
- **Containers** — compose Views/other Containers only (no raw DOM), doing data transformation.
  Name must include `Container`. **StoreConnectors** are a container subtype: HOCs using
  `connectToStores` to map Flux store state to props; name must include `StoreConnector`.

Other structural notes:

- `server/` also handles config-merging by host header via `BASE_CONFIG` (see
  `server/configs/config.js`).
- The `digitransit-*` workspace packages are consumed by the main app but built/versioned
  independently — treat them like semi-external dependencies. See `docs/WorkspacePackages.md`
  for how they're structured, tested, documented, and published.

## Server/client boundary

The repo is `"type": "module"`. Only a few entry points are loaded by Node **directly**, with no
bundler/transpiler in between: `server/**`, `webpack.config.js`, `scripts/**`, `config/*.js`.
Everything else (`app/**`, `utils/client/**`, `utils/shared/**`) is bundled by webpack
(client) or run through Mocha's Babel-ESM loader (tests), both extension-agnostic.

- `server/**` never imports from `app/**` — only from `utils/shared/`, `utils/server/`, and
  itself. It renders the SSR shell and serializes the merged config onto `window.config`; the
  client bundle never re-reads `server/configs/*` directly.
- `utils/shared/**` holds code genuinely imported by both sides (e.g. `gtfs.js`,
  `citybikeSeasonUtils.js`, `analyticsUtils.js`). `envUtils.js` is split per-consumer instead:
  `utils/server/envUtils.js` and `utils/client/envUtils.js`.
- `utils/server/**` and `utils/client/**` are single-consumer-only; don't add server-only helpers
  to `utils/client/` or vice versa.
- This boundary is enforced by ESLint's `import/no-restricted-paths` (`.eslintrc.cjs`): `server/**`
  + `utils/server/**` cannot import `app/**`/`utils/client/**`, the reverse is also forbidden, and
  `utils/shared/**` cannot import either `utils/client/**` or `utils/server/**` (it may only depend
  on other `utils/shared/**` code or external packages).
- `server/**`/`utils/shared/**`/`utils/server/**` relative imports **must** keep an explicit file
  extension — enforced by the `import/extensions: 'always'` override in `.eslintrc.cjs`.
  Everywhere else (`app/**`, `utils/client/**`, tests, `digitransit-*` packages) extensions are
  forbidden (`'never'`). The 4 `digitransit-*` workspace packages additionally need
  `resolve.fullySpecified: false` + `type: 'javascript/auto'` in `webpack.config.js` to follow the
  same extensionless policy.

## Code conventions

- ES2015+ transpiled with Babel; Airbnb JS/React style guide (`.eslintrc.cjs`) with project
  overrides: prefer object spread over `Object.assign`; `no-console` is an error; Prettier config
  is `singleQuote: true, trailingComma: 'all', arrowParens: 'avoid'`.
- When removing `defaultProps`, use parameter defaults only for valid values; never default to
  `undefined`.
- JSX-containing files use the `.jsx` extension; plain `.js` never contains JSX. The one
  exception is `test/unit/**`, which still uses `.js` for JSX pending a separate Mocha→Vitest
  migration. Relative/bare import specifiers must **not** include an extension anywhere except
  the native-ESM-loaded directories (`server/**`, `utils/shared/**`, `utils/server/**`,
  `webpack.config.js`, `scripts/**`, `config/*.js`), where an extension is required — see
  "Server/client boundary" above. `import/extensions` is not autofixable by `eslint --fix`.
- Avoid `Component.defaultProps` in function components (deprecated by React, and unsupported for
  function components in newer React versions). Declare defaults via destructuring in the
  function signature instead, e.g. `function Foo({ isMobile = false, children = null })`. This
  applies to new code and to any component touched during refactors; existing untouched
  components may still use `defaultProps` until they're otherwise modified.
- The project does not enable `eslint-plugin-react-hooks`'s `exhaustive-deps` rule, and top-level
  app values such as `config` (`useConfigContext()`) and the Fluxible `context`/`executeAction`
  bridge are set once at app init and never change identity for the app's lifetime. It's fine to
  omit such stable values from `useEffect`/`useCallback`/`useMemo` dependency arrays — prefer this
  over padding dependency arrays with values that never actually change, and add a short comment
  noting why the value is omitted.
- SCSS under `sass/`, `app/**/*.scss`, `digitransit-component/**/*.scss` — must pass
  `prettier --check` and `stylelint`.
