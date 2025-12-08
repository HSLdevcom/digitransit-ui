const validityPeriodFilter = (alert, selectedFilters) => {
  const now = Date.now() * 0.001;
  switch (selectedFilters.validityPeriod) {
    case 'VALID':
      return now >= alert.effectiveStartDate && now <= alert.effectiveEndDate;
    case 'UPCOMING':
      return alert.effectiveStartDate && now < alert.effectiveStartDate;
    case 'ALL':
    default:
      return true;
  }
};

export function filterAlerts(alerts, selectedFilters) {
  const filterFns = [validityPeriodFilter];
  return alerts.filter(alert =>
    filterFns.every(fn => fn(alert, selectedFilters)),
  );
}
