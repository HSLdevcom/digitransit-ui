# Table of Z-indices

This is a list of the existing z-index values of UI components. The z-index property should only be used when absolutely necessary, and its use should be documented in the table below.

Selector | Component | Z-Index | Comment
---------|-----------|---------|--------
`.modal-overlay` | Modal util | 1400 |
`.menu-background` | Mobile menu drawer background | 1200 |
`.menu-content` | Mobile menu drawer | 1300 |
`.search-modal` | Search modal | 1301 |
`.search-modal-overlay` | Search modal | 1100 |
`N/A` | Loading Page | 40000 |
`.spinner-loader` | RoutePage | 40000 |
`.top-bar` | AppBar | 1008 |
`div.leaflet-marker-icon.from, div.leaflet-marker-icon.to { > span { &::before` | From/To marker letters | 1000 | Could be removed through new icon components
`#splash-container` | Splash screen |  802 |
`.toggle-positioning-container` | Pan-to-your-position button | 802 |
`.message-bar` | Messagebar | 802 |
`.search-form-map-overlay` | Fake search field | 802 |
`.fullscreen-toggle` | Map fullscreen toggle | 802 |
`.background-gradient` | Shadow at top of map | 400 |
`.map-click-prevent-overlay` | Overlay to prevent interaction with map | 801 |
`.itinerary-feedback-container .form-container` | Itinerary feedback form | 800 | Component not in use
`#stop-page-action-bar` | tool bar on stop page so that the shadow casts over the map|  400 |
`.trip-from, .trip-to` | Route schedule times | 1 |
`.route-stop { div { .route-now-content { svg` | Selected trip icon with tail | 1 |
`.origin-destination-bar { .field-link { span:first-child { &::before` | Summary search bar from/to marker letters | 1 | Could be removed through new icon components
`.itinerary-summary-row { .itinerary-legs { .line` | Summary result row leg lines | 1 |
`.itinerary-summary-row { .itinerary-legs { .line { :after` | Hides the Summary result row leg lines behind the mode icon. | -1 |
`.mobile.top-bar  | Mobile top bar | 1000 |
