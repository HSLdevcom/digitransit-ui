import React from 'react';

import routeCompare from '../../../util/route-compare';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';


function getName(route) {
  if (route.shortName) {
    return (
      <span
        key={route.shortName}
        style={{ padding: '0 2px' }}
        className={`${route.mode.toLowerCase()} vehicle-number`}
      >
        {route.shortName}
      </span>
    );
  }
  return null;
}

function SelectTerminalRow(props) {
  const routeData = JSON.parse(props.routes).sort(routeCompare);

  return (
    <div className="no-margin">
      <div className="no-margin cursor-pointer" onClick={props.selectRow}>
        <div className="left padding-vertical-normal" style={{ width: 40 }}>
          <svg
            viewBox="0 0 30 30"
            width="30"
            height="30"
            style={{ position: 'relative', left: 5 }}
            className={`${props.type.toLowerCase()} left`}
          >
            <circle
              r="12.5"
              cx="15"
              cy="15"
              fill="currentColor"
              stroke="none"
            />
            <use xlinkHref="#icon-icon_station" fill="white" height="12" width="12" x="9" y="9" />
          </svg>
        </div>
        <div className="left padding-vertical-normal" style={{ width: 'calc(100% - 40px)' }}>
          <span className="h4 no-margin link-color" >
            {props.name} ›
          </span>
          <div className="route-detail-text">
            {routeData.map(getName)}
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
        name={'Pasilan Asema'}
        selectRow={() => {}}
        type={'BUS'}
        routes={'[{"mode":"BUS","shortName":"154"},{"mode":"BUS","shortName":"111T"}]'}
      />
    </ComponentUsageExample>
  </div>
);

SelectTerminalRow.propTypes = {
  type: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  selectRow: React.PropTypes.func.isRequired,
  routes: React.PropTypes.string.isRequired,
};

export default SelectTerminalRow;
