# Table of Z-indices

This is a list of the existing z-index values of UI components. The z-index property should only be used when absolutely necessary, and its use should be documented in the table below.

Selector | Component | Z-Index | Comment
---------|-----------|---------|--------
`.modal-overlay` | Modal util | 1400 |
N/A | React Material Drawer | 1200/1300 | Defined by material-ui
`.search-modal` | Search modal | 1301 |
`.search-modal-overlay` | Search modal | 1100 |
`.frontpage-panel-container .tabs-row` | Front page tabs | 1000 |
`.frontpage-panel-wrapper` | Front page pull ups (nearby, favourites) | 1000 |
`.top-bar` | AppBar | 1001 |
`div.leaflet-marker-icon.from, div.leaflet-marker-icon.to { > span { &::before` | From/To marker letters | 1000 | Could be removed through new icon components
`#splash-container` | Splash screen |  802 |
`.toggle-positioning-container` | Pan-to-your-position button | 802 |
`.message-bar` | Messagebar | 802 |
`.search-form-map-overlay` | Fake search field | 802 |
`.fullscreen-toggle` | Map fullscreen toggle | 802 |
`.background-gradient` | Shadow at top of map | 801 |
`.map-click-prevent-overlay` | Overlay to prevent interaction with map | 801 |
`.itinerary-feedback-container .form-container` | Itinerary feedback form | 800 | Component not in use
`#page-footer-container` | Frontpage footer | 800
`#stop-page-action-bar` | tool bar on stop page so that the shadow casts over the map|  400 |
`.trip-from, .trip-to` | Route schedule times | 1 |
`.route-stop { div { .route-now-content { svg` | Selected trip icon with tail | 1 |
`.origin-destination-bar { .field-link { span:first-child { &::before` | Summary search bar from/to marker letters | 1 | Could be removed through new icon components
`.itinerary-summary-row { .itinerary-legs { .line` | Summary result row leg lines | 1 |
`.itinerary-summary-row { .itinerary-legs { .line { :after` | Hides the Summary result row leg lines behind the mode icon. | -1 |
