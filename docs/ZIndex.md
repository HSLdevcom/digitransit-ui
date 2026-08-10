# Table of Z-indices

This is a list of the existing z-index values of UI components. The z-index property should only be used when absolutely necessary, and its use should be documented in the table below.

## Global, page-level layers

These values compete across *independent, page-level* stacking contexts (header,
drawers, overlays, notifications, etc). They are centralized in the
`$global-zindex` Sass map in `sass/base/_zindex.scss` and consumed via the
`global-z('name')` function, instead of being hardcoded per component. This
guarantees a single source of truth and prevents accidental collisions like the
one described in the Snackbar row below. When adding a new global layer, add it
to `$global-zindex` first (with a comment explaining why it needs that value
relative to its neighbors), then reference it with `global-z('name')`, and
update this table.

Name (`$global-zindex` key) | Selector(s) | Z-Index | Comment
-----------------------------|-------------|---------|--------
`map-overlay-shadow` | `#stop-page-action-bar` | 400 | Shadow that should sit just above the map surface.
`map-click-prevent-overlay` | `.map-click-prevent-overlay` | 801 | Overlay to prevent interaction with the map.
`desktop-settings-drawer` | `.desktop .map-content .offcanvas` | 900 | Desktop settings drawer, kept above the map overlays/buttons.
`mobile-top-bar` | `.mobile.top-bar` | 1000 | Mobile top bar.
`top-bar` | `.top-bar`, `.popup-dark-overlay` | 1008 | Desktop top bar/AppBar. `.popup-dark-overlay` intentionally shares this value so full-page dark overlays sit at the same level as the header.
`mobile-menu-background` | `.menu-background` | 1200 | Mobile main menu drawer background dimmer.
`mobile-menu-content` | `.menu-content` | 1300 | Mobile main menu drawer content panel.
`snackbar` | `.snackbar` | 9999 | Rendered via a React portal directly under `document.body` (see `app/component/Snackbar.js`) so it always escapes ancestor stacking contexts - e.g. `.desktop .map-content .offcanvas`, which forms its own stacking context via `position: relative` + `z-index: 900`. Without the portal, Snackbar's local `z-index: 9999` would only apply *within* that ancestor's stacking context and could still render behind unrelated elements (like the header) that live in a different, higher-level stacking context.
`loading-spinner` | `div.spinner-loader` | 40000 | Full-page loading spinner, must appear above everything else.

## Local, component-scoped values

These are small integers used only to order a handful of siblings *within one
component's own stacking context* (e.g. layering a couple of overlapping icons).
They don't compete with unrelated components at the page level, so they are
kept as plain literals rather than centralized. The map/search input family
below uses the separate `$zindex` ordered list (`index($zindex, name)` in
`sass/base/_zindex.scss`), which is fine for that purpose since all of those
layers live inside the same local stacking scope.

Selector | Component | Z-Index | Comment
---------|-----------|---------|--------
`.fullscreen-toggle` | Map fullscreen toggle | `index($zindex, map-fullscreen-toggle)` |
`.trip-from, .trip-to` | Route schedule times | 1 |
`.route-stop { div { .route-now-content { svg` | Selected trip icon with tail | 1 |
`.origin-destination-bar { .field-link { span:first-child { &::before` | Summary search bar from/to marker letters | 1 | Could be removed through new icon components
`.itinerary-summary-row { .itinerary-legs { .line` | Summary result row leg lines | 1 |
`.itinerary-summary-row { .itinerary-legs { .line { :after` | Hides the Summary result row leg lines behind the mode icon. | -1 |
`.desktop .map-content .map` | Contains map overlay stacking so buttons/attribution stay within the map | 1 |
`.map-cluster-number-marker` | Cluster group marker for indoor route steps | 13000 |
`.map-indoor-step-marker` | Indoor route step markers | 13050 |
`.map-subway-entrance-info-icon-metro` | Entrance markers for indoor route | 13100 |

## Known undocumented/local z-index usages (follow-up)

The audit that produced the table above found several other hardcoded
`z-index` declarations in the codebase (e.g. in `popover.scss`,
`itinerary.scss`, `navigator.scss`, `search-settings.scss`,
`date-select-grouped.scss`, `trafficnow/`). Most of these are local ordering
within a single component and are low risk, but a few (like the `1000`/`999`
pair in `navigator.scss`, explicitly commented "higher than navbar") sit close
enough to the global layers above that they deserve a closer look and possibly
migration into `$global-zindex` in a future pass.
