# Custom themes and configurations

Appearance and behavior of digitransit-ui can be customized by:
- Creating a custom config file to a path `server/configs/config.<theme>.js`
- Optionally adding CSS custom properties to `styles/themes/<theme>/theme.scss`
- Optionally adding theme-owned static assets to `static/assets/<theme>` folder
- If dynamic theme mapping to the new theme is desired, the new theme must be added to the
theme map found in `server/configs/config.default.js`

Check the existing themes such as 'oulu' for details. There is a npm script for initializing all three steps above
with a single command:

- `npm run add-theme <name> '#RRGGBB' <optional navbar logo>`

After running the command, the created skeleton files can be edited further.


## Theme styles

All themes share one stylesheet, `styles/main.scss`. A theme only changes the values of CSS custom
properties, in `styles/themes/<theme>/theme.scss`. That file starts with a `@use` of its parent
(`../waltti/theme` or `../default/theme`) and is linked before the stylesheet.

The cascade order is declared once, at the top of `styles/themes/default/theme.scss`:

```css
@layer reset, vendor, tokens, theme;
```

Later layers win regardless of specificity, and unlayered CSS beats every layer:

- `reset`: element defaults (`styles/base/_reset.scss`), the weakest styles, so anything can override them.
- `vendor`: third-party CSS, currently Leaflet.
- `tokens`: the default values from `@hsl-fi/design-system-core`.
- `theme`: the values in each theme's `theme.scss`.
- Unlayered: the app's own CSS. Keep `!important` out of layers, because it inverts their order.

Stylesheets get shared variables and mixins with `@use 'abstracts' as *;`, resolved through `loadPaths` in `webpack.config.js`. `styles/abstracts/_index.scss`
forwards them and must not emit CSS. Stylesheets that do emit CSS are listed in order in `styles/main.scss`.

To make a Sass variable themeable, define it in `styles/themes/default/theme.scss` and set it to
`var(--name)` in `styles/abstracts/_variables.scss`. Sass color functions such as `darken()` and data URIs
can't take `var()`, so themed colors need a resolved token or a `mask`.

The colors JS also needs come from the config, e.g. `config('colors.primary')`. The Sass function is
in `scripts/build/sassConfigFunctions.js`, and a missing key fails the build.


## Theme-owned static assets

Files a single deployment owns and the server hands out as-is — the social-media share image
(`socialMedia.image.url`) and any locally hosted GeoJSON layers — live in `static/assets/<theme>/`,
where the directory name is the exact `CONFIG` value. They are served from `/assets/<theme>/...`
and are copied into the served `_static/` directory by `scripts/build/copyStatic.js`.
A theme with no share image of its own inherits `assets/default/social-share.png` from
`config.default.js`. Images that are bundled into the client instead of served per request —
logos, favicons and illustrations — live in `app/assets/images/<theme>/`, which follows the same
per-theme naming, with `default/` holding the fallbacks. A config names such an image by its path
relative to that directory (e.g. `logo: 'hsl/reittiopas-logo.svg'`), which `app/assets/assetUrl.js`
resolves to the built URL.
Icons are per-theme too: `app/assets/icons/default/` holds every icon as `<id>.svg`, and a theme
overrides or adds icons by placing files with the same naming in `app/assets/icons/<theme>/`.
`scripts/build/buildSprites.js` builds each theme's sprite sheet from these; a config selects one
with `sprites: 'assets/svg-sprite.<theme>.svg'` (see `docs/Webpack.md`).
`test/unit/server/configs/staticAssets.test.js` verifies that each config's asset urls point at
existing files and that no file under `static/assets/` is unreferenced.


## Dynamic theme mapping

The UI can change the theme per request. This happens by defining how host names are mapped to theme names. See config.default.js
for details.


## Themes in development mode

Dynamic theme mapping is not available when the UI server is launched as 'npm run dev'. The desired theme can de selected as:
- `CONFIG=<theme> npm run dev`


## Themes in production mode

Dynamic theme mapping is available by default in production mode i.e. when the app is launched using `npm start` command. A single
selected theme can be forced by setting the `CONFIG` env. variable:
- `CONFIG=<theme> npm start`


## Building the production version

The build command `npm run build` collects all existing themes found from `server/configs` folder.

