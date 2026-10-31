# Custom themes and configurations

A theme is a set of files named after its `CONFIG` value. The server config is the only one required.

## Where to configure what

| What | Where |
| --- | --- |
| Features, behavior, URLs, texts | `server/configs/config.<theme>.js` |
| Colors used by both JS and CSS | `colors` in the config, read in CSS with `config('colors.x')` |
| Colors, fonts and sizes used only by CSS | `styles/themes/<theme>/theme.scss` |
| Logos, favicons and illustrations bundled into the client | `app/assets/images/<theme>/` |
| Icons | `app/assets/icons/<theme>/<id>.svg` |
| Files served as is, e.g. share images and GeoJSON | `static/assets/<theme>/` |
| Host names that select a theme | `themeMap` in `server/configs/config.default.js` |

For how stylesheets are organized, see [Styles](Styles.md).

## Adding a theme

```
yarn add-theme <name> '#RRGGBB' <optional navbar logo>
```

This creates the config and `theme.scss`, and adds the host mapping. Edit the files from there, using an
existing theme such as `oulu` as an example.

## Theme values

All themes share one stylesheet, and a theme only changes CSS custom properties. `theme.scss` starts with
a `@use` of its parent, `../waltti/theme` or `../default/theme`, and sets only what differs:

```scss
@use '../waltti/theme';

@layer theme {
  :root {
    --theme-secondary-color: #724f9f;
  }
}
```

To add a themeable value:

1. Define its default in `styles/themes/default/theme.scss`, using the value most themes want.
2. Add `$name: var(--name);` to `styles/abstracts/_variables.scss`.
3. Override it only in the themes that differ.

Colors JS also needs belong in the config, so they exist in one place: the default theme reads them
with `config('colors.primary')`. The function is in `scripts/build/sassConfigFunctions.js`, and a missing
key fails the build.

`--color-accent-primary-*` override `@hsl-fi` design system tokens, which color its buttons and links.

## Theme assets

- **Served files:** `static/assets/<theme>/`, using the exact `CONFIG` value as the directory name. They're
  served from `/assets/<theme>/...` after `scripts/build/copyStatic.js` copies them to `_static/`. A theme
  without a share image inherits `assets/default/social-share.png`.
- **Bundled images:** `app/assets/images/<theme>/`, with fallbacks in `default/`. A config names one
  relative to that directory, e.g. `logo: 'hsl/reittiopas-logo.svg'`, and `app/assets/assetUrl.js` resolves
  it to the built URL.
- **Icons:** `app/assets/icons/default/` holds every icon, and a theme overrides or adds icons with files
  of the same name. `scripts/build/buildSprites.js` builds each sprite sheet, and a config selects one with
  `sprites: 'assets/svg-sprite.<theme>.svg'` (see [Webpack](Webpack.md)).

`test/unit/server/configs/staticAssets.test.js` checks that config asset URLs point at existing files and
that nothing in `static/assets/` is unreferenced.

## Selecting a theme

- **Production:** `yarn start` picks the theme per request from the host name, using `themeMap`. Set
  `CONFIG=<theme> yarn start` to force one.
- **Development:** `CONFIG=<theme> yarn dev`. Host mapping isn't available.
- **Build:** `yarn build` builds every theme in `server/configs/`. With `CONFIG` set, it only builds that
  theme and `default`.
