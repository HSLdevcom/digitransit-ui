# Digitransit-ui

A React journey planner built on Relay and OpenTripPlanner's GraphQL API. One codebase serves many
regions (HSL, Tampere, Matka, …), and `CONFIG` selects the region's `src/server/configs/config.<region>.js`.

## Code review

Follow `REVIEW.md`.

## Layout

```
src/
  client/         browser bundle, built by webpack; entry client.jsx (router, AppProviders)
    routes/       found + Relay route trees; keep the file names, Relay query names use them
    component/    components, with topic subfolders for larger features
    hooks/        React Context providers and hooks for app state
    data/         plain modules behind the providers (favourites, position, search)
    assets/       images/<theme>/ and icons/<theme>/<id>.svg, default/ as fallback; assetUrl.js
    translations/ one file per locale
    utils/        client-only helpers
  server/         Express, native ESM, never bundled; renders only the HTML shell
    configs/      config.js (resolves the config by host) and one config.<region>.js per deployment
    utils/        server-only helpers, mostly for assembling configs
  shared/         helpers used by both the client and the server
  styles/         main.scss, abstracts/, base/, themes/<theme>/theme.scss
test/unit/        Vitest tests, mirroring src/; helpers/ and test-data/ are shared
packages/         Yarn workspaces: the published @digitransit-* packages, and private/ tooling
scripts/          build and development scripts, see scripts/README.md
static/           copied as is to _static/
docs/             topic guides; may be stale, so update them with related changes
```

- `src/client/` and `src/server/` never import each other, so code both need goes in `src/shared/`,
  which must not touch `window`, `document` or `localStorage`. ESLint enforces this
  (`import/no-restricted-paths` in `.eslintrc.cjs`).
- Relative imports in `src/server/` and `src/shared/` include the file extension, because Node loads
  them without a bundler. Everywhere else they don't.
- The server passes the merged config to the client as `window.config`, so it is public.
- Never hand-edit generated files:
  - `__generated__/` comes from relay-compiler.
  - `packages/private/schema/schema.graphql` comes from `node scripts/generate-schema.js`.
  - The icon sprite sheets come from `scripts/build/buildSprites.js`.

## Commands

You need the Node version in `engines.node`, the Yarn version in `packageManager` (`corepack enable`)
and watchman. See `docs/Installation.md`.

| Task | Command |
| --- | --- |
| Dev server at http://localhost:8080 | `API_SUBSCRIPTION_TOKEN=<key> yarn dev`, optionally with `API_TYPE=<type>` |
| Production build and server | `CONFIG=hsl yarn build && yarn start`, with `API_URL=…` for another backend |
| Lint, or fix what can be fixed | `yarn lint`, `yarn format` (also sorts translations) |
| All unit tests | `yarn test-unit` |
| Client or server tests only | `yarn test-unit-client`, `yarn test-unit-server`; add a path substring or `-t "<name>"` |
| Relay artifacts | `yarn relay` (`yarn dev` watches) |
| OTP schema changed | `node scripts/generate-schema.js`, then `yarn relay` |

- `API_TYPE` is one of:
  - `development` (the default): `dev-api.digitransit.fi`;
  - `production`: `api.digitransit.fi`;
  - `local`: OTP at `http://localhost:9080/otp/`.
- Pushing runs the whole unit suite (the pre-push hook), so a push can be slow or rejected.
- The Playwright MCP server in `.mcp.json` can drive the dev server for exploring. It is not a test runner.

## Data flow

See `docs/Architecture.md` and `docs/Navigation.md`.

- **Relay** fetches OpenTripPlanner data: routes, stops, itineraries. Fragments sit next to their
  components.
- **Everything else** comes from Context providers in `src/client/hooks/`: config, UI state,
  favourites, position and so on.
  - The providers are mounted in `AppProviders`.
  - Add a new provider there, and to `test/unit/helpers/mock-providers.jsx` if tests need it.
  - Components use these hooks, not the modules in `src/client/data/` directly.
- Write function components that fetch data and keep state with hooks. Don't add new `*Container`
  components wrapped in Relay HOCs (`createFragmentContainer` etc.).

## Code

- Airbnb style with project overrides (`.eslintrc.cjs`) and Prettier (`"prettier"` in `package.json`):
  - Use object spread, not `Object.assign`.
  - `no-console` is an error except in `src/server/` and `scripts/`.
- Only `.jsx` files contain JSX.
- Inline default exports: `export default function Foo() {}`.
- No `defaultProps` in function components:
  - Destructure defaults instead, and only for valid values, never `undefined`.
  - Convert the components you modify.
  - Put non-primitive defaults (objects, arrays, functions) in module-level constants.
- `exhaustive-deps` is off. Leave stable app-level values (`config`, provider actions such as
  `messageActions`) out of hook dependency arrays.
- Comment only where needed. Keep comments clear and concise, and describe the current state, not
  how it got there (version control has that). Document functions with short JSDoc.
- Dependencies use exact versions. The only exception is package `peerDependencies`, which use
  caret ranges of the root's version (`yarn packages-dependencies-check`).
- Polyfills are build-time only:
  - `import 'core-js/stable'` in `client.jsx`, plus `@babel/preset-env` with the `browserslist`.
  - Keep `corejs.version` in `webpack.config.js` at the installed core-js minor.
- `.dockerignore` is an allow-list. Add a `!path` line only if the image needs the file
  (`docs/Docker.md`).

## Translations

- `src/client/translations/fi.js` is the source of truth.
  - Every key must also exist in `en.js` and `sv.js` (`test/unit/client/translations/translations.test.js`).
  - `yarn format` sorts the files.
- Some `digitransit-component` packages ship their own i18next bundles, checked by
  `scripts/packages/sort-translations.js`.
- Pass `lang` to `@hsl-fi/*` components:
  - in the app, from `hslfiLocale` in `src/client/utils/hslfiLocale.js`;
  - in a package, from its `hslfiLocales` export.
  - See "Design system strings" in `docs/Packages.md`.

## Styles

See `docs/Styles.md` and `docs/Themes.md`. All themes share `src/styles/main.scss`, and a theme only
sets CSS custom properties.

- New component styles go in a `Component.module.scss` next to the component. The stylesheets listed
  in `main.scss` are legacy, and their order is the cascade order, so don't add more. Global styles
  go in `src/styles/base/`.
- **Abstracts:**
  - Stylesheets start with a relative `@use '../../styles/abstracts' as *;`.
  - `abstracts/` must not emit CSS, and local names must not reuse its names.
- **Per-theme values:**
  - Each needs a default in `themes/default/theme.scss`, a `$name: var(--name);` wrapper in
    `abstracts/_variables.scss`, and any overrides in `themes/<theme>/theme.scss`.
  - Values that don't vary stay plain Sass variables.
  - `var()` doesn't work in media queries or data URIs.
- **Colors:**
  - Colors that JS uses belong in the config's `colors`. CSS reads them with `config('colors.x')`, so
    don't repeat them in `theme.scss`.
  - Use palette variables from `abstracts` instead of hex values, and design tokens such as
    `--space-fixed-s` and `--radius-m`. An undefined `var()` fails silently, so check that a token
    exists.
- **Layers and z-index:**
  - The cascade layers are `reset, vendor, tokens, theme`, declared in `themes/default/theme.scss`.
  - App CSS is unlayered. Avoid `!important`.
  - Page-level z-indexes go in `$global-zindex` in `abstracts/_zindex.scss`.
- **Removing a class:**
  - First check `cx()` keys, HTML strings, lowercased enums, react-select's `classNamePrefix`,
    `@extend`, `class` attributes in SVGs and names that libraries add at runtime.
  - Use `git grep -nw <name>`, and search `_static/js` after a build.
- **Icons:**
  - Icon color differences go in CSS (`fill`, `currentColor`, a custom property).
  - A different shape gets its own `src/client/assets/icons/<theme>/<id>.svg` and an entry in `sprites`
    in the theme's config.

## Tests

See `docs/Tests.md`.

- Write a concise set of tests for a feature's core and app-breaking logic. Don't test that an element
  renders unless it's conditional.
- Test components from the user's side with React Testing Library. Use `renderWithProviders` or
  `TestProviders` from `test/unit/helpers/mock-providers.jsx`.
- The client suite runs with `isolate: false`, so the test files of a worker share one jsdom environment
  and module registry:
  - Leave no global state behind, e.g. use `vi.stubGlobal()` instead of assigning to `window`.
  - Stub modules with `vi.spyOn()` on the module namespace, not with `vi.mock()` (ESLint enforces
    this).
  - Module mocks that every file needs live in `test/unit/helpers/vitest.setup.js`.
- Every jsdom test fails on axe violations. `docs/Tests.md` explains when to add
  `toHaveNoA11yViolations()` and how to allow known issues.

## Packages

See `docs/Packages.md`. Treat packages as semi-external dependencies, built and versioned separately
from the app.

- Shared test and build tooling lives only in the root `devDependencies`. Package scripts call it
  with `yarn run -T <bin>`, except rollup, which `build` and `watch` call by path.
- Never edit package versions. A PR that changes any file in a package, tests included, adds a
  changeset (`yarn packages-changeset`), and CI's "Version packages" PR bumps the versions.
