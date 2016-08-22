# Table of Z-indices

This is a list of the existing z-index values of UI components. The z-index property should only be used when absolutely necessary, and its use should be documented in the table below.

Selector | Component | Z-Index | Comment
---------|-----------|---------|--------
`.search-modal` | Search modal | 1202 |
`.frontpage-panel-container .tabs-row` | Front page tabs | 1201 |
`.frontpage-panel-wrapper` | Front page pull ups (nearby, favourites) | 1200 |
`.splash` | Splash screen | 1100 |
`div.leaflet-marker-icon.from, div.leaflet-marker-icon.to { > span { &::before` | From/To marker letters | 1000 | Could be removed through new SVG components
`.toggle-positioning-container` | Pan-to-your-position button | 802 |
`.search-form-map-overlay` | Fake search field | 802 |
`.fullscreen-toggle` | Map fullscreen toggle | 802 |
`.background-gradient` | Shadow at top of map | 801 |
`.map-click-prevent-overlay` | Overlay to prevent interaction with map | 801 |
`.itinerary-feedback-container .form-container` | Itinerary feedback form | 800 | Component not in use
`.trip-from, .trip-to` | Route schedule times | 1 |
`.route-stop { div { .route-now-content { svg` | Selected trip icon with tail | 1 |
`.origin-destination-bar { .field-link { span:first-child { &::before` | Summary search bar from/to marker letters | 1 | Could be removed through new SVG components
`.itinerary-summary-row { .itinerary-legs { .line` | Summary result row leg lines | 1 |
`.itinerary-summary-row { .itinerary-legs { .line { :after` | Hides the Summary result row leg lines behind the mode icon. | -1 |
