# Digitransit-ui Copilot Instructions

Digitransit-ui is a React (Flux + Relay/GraphQL) journey-planning web app used by multiple
regional deployments (HSL, Tampere, Matka/national, etc.), configured via the `CONFIG` env var.

## Directory structure

- `app/` — client+server shared source: `action/` (Flux actions), `component/` (Views/Containers),
  `store/` (Flux stores), `configurations/` (per-region config), `translations/` (i18n),
  `util/`, `hooks/`, `__generated__/` (Relay codegen, don't hand-edit).
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

- Requires Node >= 24.14.1 and Yarn 4.13.0 (`corepack enable`). Also needs `watchman`.
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

## Tests

- Unit tests (mocha, files under `test/unit/**/*.test.js`, mirrors `app/` structure e.g.
  `test/unit/component/...`, `test/unit/store/...`, `test/unit/configurations/...`):
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
- **Flux (fluxible)** — used for everything else (app/UI state, favourites, position, search
  history). Actions in `app/action/*Actions.js`, stores in `app/store/*Store.js`. Components read
  store state via `connectToStores` HOCs ("StoreConnectors", see below).

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

- `config.default.js` holds shared config defaults each `config.<region>.js` extends/overrides;
  `ConfigContext.js` provides config via React context.
- `server/` also handles config-merging by host header via `BASE_CONFIG`; `app/client.js` /
  `app/app.js` are the client entry points.
- The `digitransit-*` workspace packages are consumed by the main app but built/versioned
  independently — treat them like semi-external dependencies with their own `CONTRIBUTING.md`.

## Code conventions

- ES2015+ transpiled with Babel; Airbnb JS/React style guide (`.eslintrc.js`) with project
  overrides: prefer object spread over `Object.assign`; `no-console` is an error; Prettier config
  is `singleQuote: true, trailingComma: 'all', arrowParens: 'avoid'`.
- `.js` files are used for JSX (no `.jsx` extension).
- SCSS under `sass/`, `app/**/*.scss`, `digitransit-component/**/*.scss` — must pass
  `prettier --check` and `stylelint`.
