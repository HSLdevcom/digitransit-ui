# Styles

## Layout

```
styles/
  main.scss        entry: lists the stylesheets that emit CSS, in cascade order
  abstracts/       Sass variables, mixins and functions; must not emit CSS
  base/            global CSS: reset, grid, elements, helper classes
  images/          images used by stylesheets
  themes/<theme>/  theme.scss, the theme's custom property values
app/component/**   component stylesheets, next to their components
```

All themes share one stylesheet. Most component styles are listed in `styles/main.scss`, because they use
global class names and their order matters. This is legacy: we're moving to CSS Modules, so don't add
component stylesheets to `main.scss`.

## Where things go

| What | Where |
| --- | --- |
| Styles for a new component | `Component.module.scss` next to it, imported by the component |
| Styles for an existing component | Its current stylesheet, or move it to a module when reworking it |
| Global element or helper styles | `styles/base/` |
| A value that differs per theme | A custom property, see [Themes](Themes.md#theme-values) |
| A value shared by stylesheets, the same in all themes | Sass variable in `styles/abstracts/_variables.scss` |
| A value used by one stylesheet | Local variable at the top of that file |
| A shared mixin | `styles/abstracts/_mixins.scss` |
| A page-level z-index | `$global-zindex` in `styles/abstracts/_zindex.scss`, see [Z-Index](ZIndex.md) |
| Third-party CSS | `@import … layer(vendor)` in `styles/main.scss` |

Every stylesheet that needs shared values starts with a relative `@use '../../styles/abstracts' as *;`,
so update the path when moving a stylesheet. Because of `as *`, a top-level `$name: …` with a name
`abstracts` defines changes the shared value for later stylesheets, so pick another name for local
variables.

Import a module with `import styles from './Component.module.scss';` and read class names as written,
e.g. `styles['route-name']`. Webpack hashes them. Vitest doesn't compile Sass and returns a class name for
any key, so a test can import the module and check `toHaveClass(styles['route-name'])`, but it won't catch
a misspelled name. Prefer testing what the user sees, as in [Tests](Tests.md).

## Cascade layers

The layer order is declared once, at the top of `styles/themes/default/theme.scss`, which loads first:

```css
@layer reset, vendor, tokens, theme;
```

Later layers win regardless of specificity, and unlayered CSS beats every layer:

- `reset`: element defaults (`styles/base/_reset.scss`).
- `vendor`: third-party CSS, currently Leaflet.
- `tokens`: default values from `@hsl-fi/design-system-core`.
- `theme`: the values in each `theme.scss`.
- Unlayered: the app's own CSS. Avoid `!important`, and keep it out of layers, where it inverts the order.

## Sass or custom property

Use a custom property for values that vary by theme or at runtime, and a Sass variable for everything
else. `var()` doesn't work in media queries or data URIs, and Sass color functions can't take it.

A class is only unused if it appears nowhere at runtime: check `cx()` keys, `class="…${x}"` in HTML
strings, lowercased enums, react-select's `classNamePrefix`, and `@extend` before removing one.
