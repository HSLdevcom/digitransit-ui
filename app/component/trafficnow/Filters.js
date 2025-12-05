import React from 'react';
import ValidityPeriodFilter from './filters/ValidityPeriodFilter';

export default function Filters() {
  const filters = [
    {
      id: 'VALIDITY_PERIOD',
      component: <ValidityPeriodFilter />,
    },
  ];
  return (
    <div className="traffic-now__content__filters">
      {filters.map(f => f.component)}
    </div>
  );
}

Filters.propTypes = {};
Filters.defaultProps = {};
