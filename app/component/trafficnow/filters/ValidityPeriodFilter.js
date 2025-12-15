import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { useFilterContext } from './FiltersContext';

const FILTER_OPTIONS = [
  { value: 'ALL', labelId: 'all' },
  { value: 'VALID', labelId: 'valid' },
  { value: 'UPCOMING', labelId: 'upcoming' },
];

const ValidityPeriodFilter = ({ filterId }) => {
  const { selectedFilters, setFilter } = useFilterContext();

  return (
    <fieldset>
      <FormattedMessage
        tagName="legend"
        id="traffic-now_filters_validity-period"
        defaultMessage="Näytä voimassaolon mukaan"
      />
      {FILTER_OPTIONS.map(option => (
        <label key={option.value} htmlFor={`period-${option}`}>
          <input
            id={`period-${option}`}
            type="radio"
            name="validityPeriodRadio"
            checked={selectedFilters[filterId] === option.value}
            value={option.value}
            onChange={() => setFilter(filterId, option.value)}
          />
          <FormattedMessage id={option.labelId} />
        </label>
      ))}
    </fieldset>
  );
};

ValidityPeriodFilter.propTypes = {
  filterId: PropTypes.string.isRequired,
};

export default ValidityPeriodFilter;
