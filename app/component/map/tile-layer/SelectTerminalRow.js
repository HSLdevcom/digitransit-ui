import PropTypes from 'prop-types';
import React from 'react';

import routeCompare from '../../../util/route-compare';
import ComponentUsageExample from '../../ComponentUsageExample';
import Icon from '../../Icon';

function getName(route) {
  if (route.shortName) {
    return (
      <span
        key={route.shortName}
        className={`${route.mode.toLowerCase()} vehicle-number`}
      >
        {route.shortName}
      </span>
    );
  }
  return null;
}

function SelectTerminalRow(props) {
  let routeData = JSON.parse(props.routes).sort(routeCompare);
  let ellipsis = null;

  if (routeData.length > 18) {
    routeData = routeData.slice(0, 19);
    ellipsis = <span className={routeData[18].mode.toLowerCase()}>...</span>;
  }

  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <Icon img={`icon-icon_${props.type.toLowerCase()}`} />
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color">
            {props.name} ›
          </span>
          <div className="route-detail-text">
            {routeData.map(getName)} {ellipsis}
          </div>
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectTerminalRow.displayName = 'SelectTerminalRow';

SelectTerminalRow.description = (
  <div>
    <p>Renders a select stop row</p>
    <ComponentUsageExample description="">
      <SelectTerminalRow
        name="Pasilan Asema"
        selectRow={() => {}}
        type="BUS"
        routes={
          '[{"mode":"BUS","shortName":"154"},{"mode":"BUS","shortName":"111T"}]'
        }
      />
    </ComponentUsageExample>
  </div>
);

SelectTerminalRow.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  selectRow: PropTypes.func.isRequired,
  routes: PropTypes.string.isRequired,
};

export default SelectTerminalRow;
