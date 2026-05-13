const validityPeriodFilter = (alert, { validityPeriod }) => {
  const now = Date.now() * 0.001;
  switch (validityPeriod) {
    case 'VALID':
      return now >= alert.effectiveStartDate && now <= alert.effectiveEndDate;
    case 'UPCOMING':
      return alert.effectiveStartDate && now < alert.effectiveStartDate;
    case 'ALL':
    default:
      return true;
  }
};

/**
 * Filters alerts by selected vehicle modes. If no modes are selected, include all alerts.
 * If any entity matches a selected mode, include the alert.
 *
 * entities may contain objects with different properties:
 * - Stop: entity with a vehicleMode property
 * - Route: entity with a mode property
 * - StopOnRoute: entity with a nested route object that has a mode property
 *
 */
const vehicleModesFilter = ({ entities }, { vehicleModes }) => {
  const modes = (vehicleModes || []).map(m => m.toLowerCase());
  return (
    modes.length === 0 ||
    entities.some(e => {
      const mode =
        /* Stop */ e.vehicleMode?.toLowerCase() ||
        /* Route */ e.mode?.toLowerCase() ||
        /* StopOnRoute */ e.route?.mode?.toLowerCase();
      return modes.includes(mode);
    })
  );
};

const entityFilter = ({ entities }, { entity }) =>
  !entity || entities.some(e => e.gtfsId === entity.gtfsId);

const favouriteFilter = ({ entities }, { favourites }) =>
  !favourites || entities.some(e => favourites.has(e.gtfsId));

/**
 * If this filter is present, only cancelledTrips should be shown
 */
const cancellationsFilter = ({ __typename }, { cancellations }) =>
  !cancellations || __typename !== 'Alert';

export function filterAndSortAlerts(alerts, selectedFilters) {
  const filterFns = [
    validityPeriodFilter,
    vehicleModesFilter,
    entityFilter,
    favouriteFilter,
    cancellationsFilter,
  ];

  return alerts
    .filter(alert => filterFns.every(fn => fn(alert, selectedFilters)))
    .sort((a, b) => a.effectiveStartDate - b.effectiveStartDate);
}
