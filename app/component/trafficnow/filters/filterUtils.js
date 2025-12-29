import { AlertSeverityLevelType } from '../../../constants';

const SEVERITY_ORDER = {
  [AlertSeverityLevelType.Severe]: 0,
  [AlertSeverityLevelType.Warning]: 1,
  [AlertSeverityLevelType.Info]: 2,
  DEFAULT: 3,
};

const isActiveWarning = alert => {
  const now = Date.now() * 0.001;
  const { effectiveStartDate, effectiveEndDate, alertSeverityLevel } = alert;
  const isActive = effectiveStartDate <= now && now <= effectiveEndDate;
  const isInfo = alertSeverityLevel === AlertSeverityLevelType.Info;
  return isActive && !isInfo;
};

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
 * Active WARNING|SEVERE alerts are preceding INFO alerts. Inactive (e.g. upcoming) alerts
 * are sorted asc by date
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

export function filterAndSortAlerts(alerts, selectedFilters) {
  const filterFns = [validityPeriodFilter, vehicleModesFilter];

  return alerts
    .filter(alert => filterFns.every(fn => fn(alert, selectedFilters)))
    .sort((a, b) => {
      const aIsActiveWarning = isActiveWarning(a);
      const bIsActiveWarning = isActiveWarning(b);

      if (aIsActiveWarning && !bIsActiveWarning) {
        return -1;
      }
      if (!aIsActiveWarning && bIsActiveWarning) {
        return 1;
      }

      if (aIsActiveWarning && bIsActiveWarning) {
        const aSeverity =
          SEVERITY_ORDER[a.alertSeverityLevel] ?? SEVERITY_ORDER.DEFAULT;
        const bSeverity =
          SEVERITY_ORDER[b.alertSeverityLevel] ?? SEVERITY_ORDER.DEFAULT;
        if (aSeverity !== bSeverity) {
          return aSeverity - bSeverity;
        }

        return a.effectiveStartDate - b.effectiveStartDate;
      }

      return a.effectiveStartDate - b.effectiveStartDate;
    });
}
