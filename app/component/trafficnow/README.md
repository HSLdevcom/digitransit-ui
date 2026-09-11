# TrafficNow

## Overview
TrafficNow queries and renders disruption information from two separate OTP data sources in one view:
- Alert disruptions from GraphQL `alerts`
- Canceled departures from GraphQL `canceledTripsSummary`

The feature has two user flows:
1. Overview flow: mixed disruption list with filtering.
2. Mode-specific flow: detailed canceled departures for a selected mode.

## Architecture and Data Flow

### Entry routing
- `TrafficNow.js` is the feature root.
- If route param `mode` exists, TrafficNow renders mode-specific canceled trips (`CanceledTripsContainer`).
- Otherwise, it renders overview disruptions (`Disruptions`) inside `FilterContextProvider`.

### Overview flow
1. `Disruptions.js` loads alerts with `AlertsQuery` and cancellations with `CanceledTripsOverviewQuery`
   (both via `useLazyLoadQuery`, one request each - no pagination).
2. Alerts are filtered and sorted by `filterAndSortAlerts` from `filters/filterUtils.js`.
3. Each alert is split into one card per affected transport mode by `buildDisruptionCards`
   (in `utils.js`) - an alert covering multiple modes yields multiple cards.
4. UI list rendering order is:
- canceled trips cards first (`CanceledTripCard`), one per mode with cancellations
- alert cards second (`DisruptionCard`)

### Mode-specific cancellations flow
1. `CanceledTripsContainer.js` loads all canceled routes for the selected mode in a single
   `useLazyLoadQuery` request (`CanceledTripsForModeQuery`) - not paginated.
2. `CanceledTrips.js` renders the routes but only reveals `DEFAULT_ROUTES_SHOWN_AMOUNT` (8) at a
   time client-side, with a "show more" button to reveal more routes from the already-loaded data.
3. Within each route, `components/CanceledDepartures.js` groups canceled trips by service date and
   also caps visible departure times (`DEPARTURE_LIMIT`, default 10) with a per-date "show all" expand.

## Data Sources and GraphQL

### Alerts
`queries/AlertsQuery.js` fetches:
- alert metadata (`id`, severity, effect, header, description, URL)
- active period (`effectiveStartDate`, `effectiveEndDate`)
- entities (`Stop`, `Route`, `StopOnRoute`)

### Canceled trips overview
`queries/CanceledTripsOverviewQuery.js` requests one canceledTripsSummary per mode:
- BUS
- TRAM
- RAIL
- SUBWAY
- FERRY

Each mode query is conditionally included with `@include` booleans from available config modes.

### Canceled trips mode details
`queries/CanceledTripsForModeQuery.js` fetches all routes/patterns for one mode in a single query.
Pattern-level fields (headsign, stops, departures) come from `CanceledTripsPatternFragment`, which
in turn spreads `CanceledDeparturesFragment`. Neither is a relay cursor-pagination fragment; both
are plain fragments loaded up front.

## Card Types and Grouping Rules

### Canceled trips cards (`CanceledTripCard.js`)
Rules in overview:
1. One card per mode that has at least one cancellation (`Disruptions.js`'s `getCanceledModes`).
2. Routes within a card are ordered by `sortRoutes` (`utils.js`): route `shortName` alphabetically,
   then favourited routes first, then the currently highlighted/selected entity (`highlightedGtfsId`)
   first.
3. Only the first `trafficNowMaxRoutesPerCard` (config value) routes are shown as badges; any
   remaining routes are collapsed into a single "+N" `EntityBadge`.
4. If the card has exactly one route, its canceled departures are shown inline via
   `CanceledDepartures` (`departureLimit={5}`) instead of a badge.

### Alert cards (`DisruptionCard.js`)
Rules:
1. Each alert produces one card per affected transport mode (see `buildDisruptionCards` in
   `utils.js`) - not one card per alert. Alerts with no recognized mode get a single card.
2. Badge variant is based on `alertSeverityLevel`; label is `alertEffect`.
3. Card status is Active or Upcoming from effective timestamps.
4. Affected entities for that mode are shown via `RouteBadges` (compact mode, capped the same way
   as cancellation cards, with a "+N" overflow badge).

## Filtering and Sorting

### Filter state
`filters/FiltersContext.js` default filters:
- `now: Date.now()`
- `noEffect: 'NO_EFFECT'`
- `validityPeriod: 'ALL'`
- `vehicleModes: []`

### Filter chain
`filters/filterUtils.js` applies filters in this exact order:
1. `pastFilter`
2. `noEffectFilter`
3. `validityPeriodFilter`
4. `vehicleModesFilter`
5. `entityFilter`
6. `favouriteFilter`
7. `cancellationsFilter`

Important behavior:
- `cancellationsFilter` removes GraphQL alerts (`__typename === 'Alert'`) when cancellations-only toggle is active.
- Canceled trips still remain visible, because they are rendered from separate `canceledTrips` data.
- `filterCanceledModes` applies only `entityFilter`/`favouriteFilter` to cancellation routes
  (cancellations have no severity/effect/validity fields to filter on).

### Sorting order
`filterAndSortAlerts` sorts the filtered alerts by `effectiveStartDate` ascending only. There is no
severity-based ordering - all active/upcoming alerts are interleaved by start date.

## Badge Behavior

### Alert entity badges
`RouteBadges.js` and `utils.js` behavior:
1. If all entities are `Unknown`, no badges are rendered.
2. Entities are grouped by mode and by type (route vs stop/station).
3. Duplicates are removed by entity id.
4. Group members are sorted alphanumerically by display name.
5. `RouteBadgeGroup` can highlight currently selected entity via `highlightedGtfsId`.

Note: `RouteBadges.js` (wraps `RouteBadgeGroup` + `EntityBadge`, used by `DisruptionCard.js` /
`DisruptionDetailsContainer.js` for alert entities) and `components/RouteBadgeGroup.js` (used
directly by `CanceledTripCard.js` for cancellation routes) are two separate badge-rendering
entry points built on the same underlying grouping/highlight rules.

## Key Files
- `TrafficNow.js`: entry component and route split.
- `TrafficNowHeader.js` / `TrafficNowFooter.js` / `TrafficNowLink.js`: shared chrome and navigation link.
- `Disruptions.js`: overview data load, filter application, disruption-card splitting, mixed rendering.
- `CanceledTripCard.js`: overview canceled-trip card (per mode).
- `CanceledTripsContainer.js`: mode-detail data load.
- `CanceledTrips.js`: mode-detail route list with client-side progressive reveal.
- `DisruptionCard.js` / `DisruptionBadge.js`: alert card UI and badge styling.
- `DisruptionDetailsContainer.js`: single-alert detail view.
- `RouteBadges.js`: entity badge rendering orchestration for alerts.
- `utils.js`: mode availability, entity grouping, disruption-card building, route sorting.
- `filters/FiltersContext.js`: filter defaults and state API.
- `filters/filterUtils.js`: filter chain and sorting implementation.
- `components/CanceledDepartures.js`: per-route, per-date departure list with expand.
- `components/CancellationContainer.js`: per-route wrapper rendering patterns + `CanceledDepartures`.
- `components/PatternWithCancellations.js`: per-pattern cancellation rendering.
- `components/RouteBadgeGroup.js`: shared route/stop badge group renderer.
- `components/EntityBadge.js`: single badge (route, stop, or "+N" overflow).
- `components/DisruptionStatus.js`: Active/Upcoming status label.
- `components/ResultsProgressBar.js`: "show more" progress indicator.
- `components/NoDisruptions.js`: empty-state message.
- `queries/*`: feature GraphQL documents and fragments.

## Maintenance Notes
1. When adding a new filter, update both `DEFAULT_FILTERS` in `FiltersContext.js` and filter execution order in `filterUtils.js`.
2. When changing card composition order in overview, update `Disruptions.js` render sequence.
3. When adding a new transport mode, verify:
- mode availability from config (`getAvailableModes`)
- query include variables in `CanceledTripsOverviewQuery`
- mode rendering in cards and filters
4. If cancellation grouping/sorting logic changes, ensure overview (`CanceledTripCard.js`) and mode detail (`CanceledTripsContainer.js`/`CanceledTrips.js`) stay conceptually aligned, since both use `sortRoutes` from `utils.js`.

## TODO
- Change `Disruptions` view to render paginated results when OTP endpoint supports pagination
  - Blocked until API updates
