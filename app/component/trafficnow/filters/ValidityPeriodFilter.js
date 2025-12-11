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
      <legend>Näytä voimassaolon mukaan</legend>
      {FILTER_OPTIONS.map(option => (
        <label key={option.value}>
          <input
            type="radio"
            name="myRadio"
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
