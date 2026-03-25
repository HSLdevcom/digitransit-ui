import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { useFilterContext } from './FiltersContext';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getTransportModes } from '../../../util/modeUtils';
import { TrafficNowTransportModes } from '../../../constants';

const VehicleModesFilter = ({ filterId }) => {
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
      if (
        v.availableForSelection &&
        TrafficNowTransportModes.includes(k.toUpperCase())
      ) {
        acc.push(k);
      }
      return acc;
    },
    [],
  );

  return (
    <fieldset>
      <FormattedMessage
        id="traffic-now_filters_vehicle-mode"
        defaultMessage="Filter by vehicle mode"
      >
        {msg => <legend className="input-legend">{msg}</legend>}
      </FormattedMessage>
      {availableModes.map(option => (
        <label
          key={option}
          htmlFor={`vehicleModes-${option}`}
          className="input-label"
        >
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
