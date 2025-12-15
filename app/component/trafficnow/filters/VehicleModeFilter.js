import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { useFilterContext } from './FiltersContext';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getTransportModes } from '../../../util/modeUtils';

const VehicleModeFilter = ({ filterId }) => {
  const config = useConfigContext();
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

  const availableModes = Object.entries(getTransportModes(config)).reduce(
    (acc, [k, v]) => {
      if (v.availableForSelection) {
        acc.push(k);
      }
      return acc;
    },
    [],
  );

  return (
    <fieldset>
      <FormattedMessage
        tagName="legend"
        id="traffic-now_filters_vehicle-mode"
        defaultMessage="Näytä liikennevälineen mukaan"
      />
      {availableModes.map(option => (
        <label key={option} htmlFor={`vehicleMode-${option}`}>
          <input
            id={`vehicleMode-${option}`}
            type="checkbox"
            checked={selectedFilters[filterId]?.includes(option)}
            value={option}
            onChange={() => handleCheck(option)}
          />
          <FormattedMessage id={option} />
        </label>
      ))}
    </fieldset>
  );
};

VehicleModeFilter.propTypes = {
  filterId: PropTypes.string.isRequired,
};

export default VehicleModeFilter;
