# TrafficNow

## Overview
TrafficNow queries and renders disruption information from two separate OTP data sources in one view:
- Alert disruptions from GraphQL `alerts`
- Canceled departures from GraphQL `canceledTrips`

The feature has two user flows:
1. Overview flow: mixed disruption list with filtering.
2. Mode-specific flow: detailed canceled departures for a selected mode.

## Architecture and Data Flow

### Entry routing
- `TrafficNow.js` is the feature root.
- If route param `mode` exists, TrafficNow renders mode-specific canceled trips (`CanceledTripsContainer`).
- Otherwise, it renders overview disruptions (`Disruptions`) inside `FilterContextProvider`.

### Overview flow
1. `Disruptions.js` loads alerts with `AlertsQuery`.
2. `Disruptions.js` loads canceled trips overview with `CanceledTripsOverviewQuery`.
3. Alerts are filtered and sorted by `filterAndSortAlerts` from `filters/filterUtils.js`.
4. UI list rendering order is:
- canceled trips cards first (`CanceledTripCard`)
- alert cards second (`DisruptionCard`)

### Mode-specific cancellations flow
1. `CanceledTripsContainer.js` and `CanceledTrips.js` load paginated mode-specific data via Relay pagination fragment/query.
2. Trips are grouped for display by:
- `routeShortName`
- then `patternCode`
3. Details are shown in `CanceledTripsModal` when selected.

## Data Sources and GraphQL

### Alerts
`queries/AlertsQuery.js` fetches:
- alert metadata (`id`, severity, effect, header, description, URL)
- active period (`effectiveStartDate`, `effectiveEndDate`)
- entities (`Stop`, `Route`, `StopOnRoute`)

### Canceled trips overview
`queries/CanceledTripsOverviewQuery.js` requests one canceledTrips connection per mode:
- BUS
- TRAM
- RAIL
- SUBWAY
- FERRY

Each mode query is conditionally included with `@include` booleans from available config modes.

### Canceled trips mode details
`queries/CanceledTripsForModeQuery.js` uses a pagination fragment (`CanceledTripsPaginationFragment`) for incremental loading in mode view.

## Card Types and Grouping Rules

### Canceled trips cards (`CanceledTripCard.js`)
Rules in overview:
1. One card per mode appears when that mode has `edges.length > 0`.
2. A node is skipped if either is missing:
- `trip.route.gtfsId`
- `start.schedule.time.departure`
3. Card-internal grouping key is `trip.route.shortName`.
4. Departure times are formatted to `HH:mm`.
5. If exactly one grouped route exists, canceled departure times are displayed directly in the card.
6. If `totalCount > trips.length`, an ellipsis indicator is shown.

### Alert cards (`DisruptionCard.js`)
Rules:
1. One alert equals one card.
2. Badge variant is based on `alertSeverityLevel`; label is `alertEffect`.
3. Card status is Active or Upcoming from effective timestamps.
4. Expanded card can show external details button if `alertUrl` exists.

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

### Sorting order
`filterAndSortAlerts` sorting behavior:
1. Active non-info alerts (warning/severe) before others.
2. If both are active warnings, sort by severity order:
- `SEVERE`
- `WARNING`
- `INFO`
- default fallback
3. Then by `effectiveStartDate` ascending.
4. Non-prioritized alerts are also sorted by `effectiveStartDate` ascending.

## Badge Behavior

### Alert entity badges
`RouteBadges.js` and `utils.js` behavior:
1. If all entities are `Unknown`, no badges are rendered.
2. Entities are grouped by mode and by type (route vs stop/station).
3. Duplicates are removed by entity id.
4. Group members are sorted alphanumerically by display name.
5. `RouteBadgeGroup` can highlight currently selected entity via `highlightedGtfsId`.

## Key Files
- `TrafficNow.js`: entry component and route split.
- `Disruptions.js`: overview data load, filter application, mixed rendering.
- `CanceledTripCard.js`: overview canceled-trip grouping and card content.
- `CanceledTrips.js`: mode-specific grouping and pagination behavior.
- `DisruptionCard.js`: alert card UI and expansion behavior.
- `filters/FiltersContext.js`: filter defaults and state API.
- `filters/filterUtils.js`: filter chain and sorting implementation.
- `RouteBadges.js`: entity badge rendering orchestration.
- `utils.js`: mode availability and entity grouping utilities.
- `queries/*`: feature GraphQL documents and fragments.

## Maintenance Notes
1. When adding a new filter, update both `DEFAULT_FILTERS` in `FiltersContext.js` and filter execution order in `filterUtils.js`.
2. When changing card composition order in overview, update `Disruptions.js` render sequence.
3. When adding a new transport mode, verify:
- mode availability from config (`getAvailableModes`)
- query include variables in `CanceledTripsOverviewQuery`
- mode rendering in cards and filters
4. If cancellation grouping logic changes, ensure overview (`CanceledTripCard.js`) and mode detail (`CanceledTrips.js`) stay conceptually aligned.

## TODO
- Move `CanceledTripsContainer` under `FilterContextProvider` and have the selected filters affect CanceledTrips as well
  - Added filtering based on mode selection, more filters could be added when the api supports them
- Add a reasonable unit test suite
- Change CanceledTrips view to render on route basis when OTP endpoint supports such response
  - Currently the response contains cancellations on cancellation basis which results in bad UX if all cancellations don't fit in the initial 20 node quota.
- Change `Disruptions` view to render paginated results when OTP endpoint supports pagination
  - Blocked until API updates
- Change `DisruptionCard` onClick behavior to "drill" into a new view with the card content instead of expanding the card. 
- Define whether and how to present `canceledTrips` that are in future (i.e. tomorrow and beyond)
  - Show cancelations on the current day as ongoing, future cancelations as upcoming
  - Needs to wait until api updates
