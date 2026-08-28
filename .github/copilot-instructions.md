# Digitransit-ui Copilot Instructions

Digitransit-ui is a React (Flux + Relay/GraphQL) journey-planning web app used by multiple
regional deployments (HSL, Tampere, Matka/national, etc.), configured via the `CONFIG` env var.

## Directory structure

- `app/` — client+server shared source, entry points and route trees at the top level:
  `app.js` (fluxible app/store wiring), `client.js` (browser entry, farce/found router bootstrap),
  `server.js` (SSR entry), `config.js` (server-side config resolution/merging by host),
  `routes.js` / `routeRoutes.js` / `stopRoutes.js` (found + Relay route-tree definitions for the
  front page, route pages, and stop pages respectively), `constants.js`, `meta.js` (page
  metadata), `i18n.js`, `buildInfo.js` (generated build stamp, don't hand-edit). Subfolders:
  - `component/` — Has topic subfolders
    for larger features: `itinerary/`, `map/`, `stop/`, `routepage/`, `nearyou/`, `trafficnow/`
    (has its own `README.md`), `embedded/`, `visual/`, `icon/`, and `__generated__/` (Relay codegen).
  - `action/` — Flux action creators (one file per domain, e.g. `FavouriteActions.js`).
  - `store/` — Flux stores (one file per domain, mirrors `action/`), plus `localStorage.js` /
    `sessionStorage.js` persistence helpers.
  - `hooks/` — shared React hooks; small today but growing, since new code should prefer
    hooks-based state over Flux (see Architecture below).
  - `configurations/` — `config.default.js` plus one `config.<region>.js` per deployment, and
    `ConfigContext.js` (React context provider for config).
  - `util/` — pure helper modules (date/fare/color/analytics/etc.), plus its own `__generated__/`
    for Relay fragments used by utils.
  - `translations/` — one file per locale (`fi.js`, `en.js`, `sv.js`, ...); `fi.js` is the source
    of truth, keep sorted via `scripts/sort-translations.mjs` (`yarn format` runs this), and every
    key must also exist in `en.js`/`sv.js` (enforced by `test/unit/translations.test.js`).
  - `__generated__/` — Relay codegen for the top-level route query definitions, don't hand-edit.
- `server/` — Express SSR server.
- `test/` — `unit/` (mocha, mirrors `app/`) and `e2e/` (Jest + Playwright visual tests).
- `scripts/` — dev helper scripts (`ui.sh`, `sort-translations.mjs`, `contextHelper.js`,
  `generate-schema.js`, `theme/` theme-scaffolding scripts; see `scripts/README.md`).
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
- `yarn install && yarn setup` — installs deps and builds the `digitransit-*` workspace packages
  (components/search-util/store/util) that live under `digitransit-component/`,
  `digitransit-search-util/`, `digitransit-store/`, `digitransit-util/`. **After editing any file
  in one of these workspaces, re-run `yarn setup` (or the relevant `build-*` script) for changes
  to be picked up by the main app.**
- `yarn run dev` — dev server at http://localhost:8080 (webpack-dev-server + nodemon server +
  relay-watch + component watch, run in parallel via one script). Runs against mock/no API keys.
- `source scripts/ui.sh` then `uidev <config>` / `uiprod <config>` / `uilocal <config>` — run the
  dev server against real APIs (map tiles, geocoding, etc.):
  - `uidev` — dev API; requires `DEV_SUBSCRIPTION_KEY` env var.
  - `uiprod` — prod API (`api.digitransit.fi`); requires `SUBSCRIPTION_KEY` env var.
  - `uilocal` — local OTP at `http://localhost:9080/otp/`; requires `DEV_SUBSCRIPTION_KEY`.
  - Set `NO_SUBSCRIPTION_KEY=true` to skip the key requirement instead.
- `yarn run build` then `yarn run start` — production build/run. Use `CONFIG=hsl` (or `tampere`,
  `matka`, etc., see `app/configurations/config.*.js`) to select a regional config, and
  `API_URL=...` to point at a different OTP/geocoding backend.
- If the OTP GraphQL schema changes: `node scripts/generate-schema.js` (regenerates
  `schema/schema.graphql`; `relay-compiler` then regenerates `app/__generated__` on build/dev).

## Lint & format

- `yarn lint` — eslint (Airbnb config + jsx-a11y + compat + prettier) + `prettier-styles` (scss
  check) + `stylelint`.
- `yarn format` — auto-fixes: sorts translations, `eslint --fix`, prettier styles, stylelint fix.
- `yarn eslint` / `yarn eslint-fix` for JS only.
- Husky git hooks: pre-commit runs `lint-staged` (eslint on staged JS, prettier+stylelint on
  staged scss) and blocks on unresolved merge-conflict markers; pre-push runs the full
  `yarn run test-unit` suite, so pushes can be slow or rejected if unit tests fail.

## Tests

- Unit tests (mocha, files under `test/unit/**/*.test.js`, mirrors `app/` structure e.g.
  `test/unit/component/...`, `test/unit/store/...`, `test/unit/configurations/...`). This setup is
  currently under refactoring — verify commands against `package.json` if they seem out of date:
  - Run all: `yarn test-unit` (runs app + workspace `store`/`component` package tests).
  - Run just the app suite: `yarn test-unit:app`.
  - Run a single test by name (grep on describe/it or filename stem):
    `yarn test-single -g <pattern>` (this is `test-unit:app -g <pattern>`).
  - Watch mode: `yarn run test-unit -- --watch`.
- E2E/visual tests (Jest + Playwright, config under `test/e2e/jest.config.js`), require a prior
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

- `server/` also handles config-merging by host header via `BASE_CONFIG` (see `app/config.js`).
- The `digitransit-*` workspace packages are consumed by the main app but built/versioned
  independently — treat them like semi-external dependencies with their own `CONTRIBUTING.md`.

## Code conventions

- ES2015+ transpiled with Babel; Airbnb JS/React style guide (`.eslintrc.js`) with project
  overrides: prefer object spread over `Object.assign`; `no-console` is an error; Prettier config
  is `singleQuote: true, trailingComma: 'all', arrowParens: 'avoid'`.
- `.js` files are used for JSX (no `.jsx` extension).
- SCSS under `sass/`, `app/**/*.scss`, `digitransit-component/**/*.scss` — must pass
  `prettier --check` and `stylelint`.
