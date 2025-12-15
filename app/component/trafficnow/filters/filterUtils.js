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

const vehicleModeFilter = ({ entities }, { vehicleMode }) => {
  const modes = vehicleMode || [];
  return (
    modes.length === 0 ||
    entities.some(e => {
      const mode = e.vehicleMode?.toLowerCase() || e.mode?.toLowerCase();
      if (e.locationType === 'STOP' && e.platformCode) {
        return modes.includes('rail');
      }
      return modes.includes(mode);
    })
  );
};

export function filterAndSortAlerts(alerts, selectedFilters) {
  const filterFns = [validityPeriodFilter, vehicleModeFilter];
  return alerts
    .filter(alert => filterFns.every(fn => fn(alert, selectedFilters)))
    .sort((a, b) => a.effectiveStartDate - b.effectiveStartDate);
}
