import React from 'react';

import { FormattedMessage } from 'react-intl';

import RouteDestination from '../../departure/route-destination';
import routeCompare from '../../../util/route-compare';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';


function getName(p) {
  if (p.shortName) {
    return (
      <span
        key={p.shortName}
        style={{ padding: '0 2px' }}
        className={`${p.type.toLowerCase()} vehicle-number`}
      >
        {p.shortName}
      </span>
    );
  }
  return null;
}

function SelectStopRow(props) {
  const patternData = JSON.parse(props.patterns).sort(routeCompare);
  const patterns = [];

  patterns.push(
    <div
      key="first"
      className="route-detail-text"
    >
      <span
        className={`${patternData[0].type.toLowerCase()} vehicle-number no-padding`}
      >
        {patternData[0].shortName}
      </span> {}
      <RouteDestination
        mode={patternData[0].type}
        destination={patternData[0].headsign}
      />
    </div>
  );

  if (patternData.length > 1) {
    patterns.push(
      <div
        key="second"
        className="route-detail-text"
      >
        <FormattedMessage
          id="in-addition"
          defaultMessage="In addition"
        />
        {patternData.slice(1).map(getName)}
      </div>
    );
  }

  return (
    <div
      className="no-margin"
    >
      <hr
        className="no-margin"
      />
      <div
        className="no-margin cursor-pointer" onClick={props.selectRow}
      >
        <div
          className="left padding-vertical-normal" style={{ width: 40 }}
        >
          <svg
            xmlns="http://www.w3.org/svg/2000"
            viewBox="0 0 30 30"
            width="30"
            height="30"
            style={{ position: 'relative', left: 5 }}
            className={`${props.type.toLowerCase()} left`}
          >
            <circle
              r="7"
              cx="15"
              cy="15"
              strokeWidth="6.5"
              fill="None"
              stroke="currentColor"
            />
          </svg>
        </div>
        <div
          className="left padding-vertical-normal" style={{ width: 'calc(100% - 40px)' }}
        >
          <span
            className="h4 no-margin link-color"
          >
            {props.name} ›
          </span>
          {patterns}
        </div>
      </div>
    </div>
  );
}

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.description = (
  <div>
    <p>Renders a select stop row</p>
    <ComponentUsageExample description="">
      <SelectStopRow
        name={'DIAKONIAPUISTO'}
        selectRow={() => console.log('test')}
        type={'BUS'}
        patterns={'[{"headsign":"Kuninkaanmäki","type":"BUS","shortName":"518"}]'}
      />
    </ComponentUsageExample>
  </div>
);

SelectStopRow.propTypes = {
  type: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  selectRow: React.PropTypes.func.isRequired,
  patterns: React.PropTypes.string.isRequired,
};

export default SelectStopRow;
