import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { useFilterContext } from './FiltersContext';
import { TrafficNowTransportModes } from '../../../constants';

const VehicleModesFilter = ({ filterId }) => {
  const { selectedFilters, setFilter } = useFilterContext();

  const handleCheck = option => {
    const checked = selectedFilters[filterId] || [];

    if (checked.includes(option)) {
      setFilter(
        filterId,
        checked.filter(c => c !== option),
      );
    } else {
      setFilter(filterId, [...checked, option]);
    }
  };

  return (
    <fieldset>
      <FormattedMessage
        tagName="legend"
        id="traffic-now_filters_vehicle-mode"
        defaultMessage="Näytä liikennevälineen mukaan"
      />
      {TrafficNowTransportModes.map(option => (
        <label key={option} htmlFor={`vehicleModes-${option}`}>
          <input
            id={`vehicleModes-${option}`}
            type="checkbox"
            checked={selectedFilters[filterId]?.includes(option)}
            value={option}
            onChange={() => handleCheck(option)}
          />
          <FormattedMessage id={option.toLowerCase()} />
        </label>
      ))}
    </fieldset>
  );
};

VehicleModesFilter.propTypes = {
  filterId: PropTypes.string.isRequired,
};

export default VehicleModesFilter;
