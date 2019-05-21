import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../Icon';
import ComponentUsageExample from '../../ComponentUsageExample';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
} from '../../../util/citybikes';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function SelectCityBikeRow({ selectRow, name, networks }, { config }) {
  const img = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(getCityBikeNetworkId(networks), config),
  );
  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img={img} />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">{name} ›</span>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectCityBikeRow.displayName = 'SelectCityBikeRow';

SelectCityBikeRow.description = (
  <div>
    <p>Renders a select citybike row</p>
    <ComponentUsageExample description="">
      <SelectCityBikeRow name="LINNANMÄKI" selectRow={() => {}} />
    </ComponentUsageExample>
  </div>
);

SelectCityBikeRow.propTypes = {
  selectRow: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  networks: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
};

SelectCityBikeRow.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default SelectCityBikeRow;
