import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { useFilterContext } from './FiltersContext';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getTransportModes } from '../../../util/modeUtils';
import { TrafficNowTransportModes } from '../../../constants';
import Icon from '../../Icon';

const VehicleModesFilter = ({ filterId }) => {
  const config = useConfigContext();
  const intl = useIntl();
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
      <legend className="input-legend">
        {intl.formatMessage({
          id: 'traffic-now_filters_vehicle-mode',
          defaultMessage: 'Filter by vehicle mode',
        })}
      </legend>
      {availableModes.map(option => (
        <div key={option} className="traffic-now__filters-mode-option">
          <label htmlFor={`vehicleModes-${option}`} className="input-label">
            <Icon
              img={`icon_${option.toLowerCase()}`}
              className={option.toLowerCase()}
              height={1.5}
              width={1.5}
            />
            {intl.formatMessage({ id: option.toLowerCase() })}
          </label>
          <input
            id={`vehicleModes-${option}`}
            type="checkbox"
            checked={selectedFilters[filterId]?.includes(option)}
            value={option}
            onChange={() => handleCheck(option)}
          />
        </div>
      ))}
    </fieldset>
  );
};

VehicleModesFilter.propTypes = {
  filterId: PropTypes.string.isRequired,
};

export default VehicleModesFilter;
