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
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <div
        className="stop-popup-choose-row cursor-pointer select-row"
        onClick={selectRow}
      >
        <span className="choose-row-left-column" aria-hidden="true">
          <Icon img={img} />
        </span>
        <span className="choose-row-center-column">
          <h5 className="choose-row-header">{name}</h5>
        </span>
        <span className="choose-row-right-column">
          <Icon img="icon-icon_arrow-collapse--right" />
        </span>
      </div>
    </>
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
