import React from 'react';

import { FormattedMessage } from 'react-intl';
import uniqBy from 'lodash/uniqBy';
import reject from 'lodash/reject';

import RouteDestination from '../../RouteDestination';
import routeCompare from '../../../util/route-compare';
import ComponentUsageExample from '../../ComponentUsageExample';


function getName(pattern) {
  if (pattern.shortName) {
    return (
      <span
        key={pattern.shortName}
        className={`${pattern.type.toLowerCase()} vehicle-number`}
      >
        {pattern.shortName}
      </span>
    );
  }
  return null;
}

function SelectStopRow(props) {
  const patternData = JSON.parse(props.patterns).sort(routeCompare);
  const patterns = [];

  patterns.push(
    <div key="first" className="route-detail-text" >
      <span className={`${patternData[0].type.toLowerCase()} vehicle-number no-padding`} >
        {patternData[0].shortName}
      </span>
      {'\u00a0'}
      <RouteDestination mode={patternData[0].type} destination={patternData[0].headsign} />
    </div>,
  );

  if (patternData.length > 1) {
    const otherPatterns = reject(patternData, ['shortName', patternData[0].shortName]);
    if (otherPatterns.length > 0) {
      patterns.push(
        <div key="second" className="route-detail-text">
          <span className="gray">
            <FormattedMessage id="in-addition" defaultMessage="In addition" />
          </span>
          {uniqBy(otherPatterns, pattern => pattern.shortName).map(getName)}
        </div>);
    }
  }

  return (
    <div className="no-margin">
      <div className="cursor-pointer select-row" onClick={props.selectRow}>
        <div className="padding-vertical-normal select-row-icon">
          <svg
            viewBox="0 0 30 30"
            width="30"
            height="30"
            style={{ position: 'relative', left: 5 }}
            className={`${props.type.toLowerCase()} left`}
          >
            <circle
              r="8"
              cx="15"
              cy="15"
              strokeWidth="3"
              fill="None"
              stroke="currentColor"
            />
          </svg>
        </div>
        <div className="padding-vertical-normal select-row-text">
          <span className="header-primary no-margin link-color" >
            {props.name} ›
          </span>
          {patterns}
        </div>
        <div className="clear" />
      </div>
      <hr className="no-margin gray" />
    </div>
  );
}

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.description = () =>
  <div>
    <p>Renders a select stop row</p>
    <ComponentUsageExample description="">
      <SelectStopRow
        name={'DIAKONIAPUISTO'}
        selectRow={() => {}}
        type={'BUS'}
        patterns={'[{"headsign":"Kuninkaanmäki","type":"BUS","shortName":"518"}]'}
      />
    </ComponentUsageExample>
  </div>;

SelectStopRow.propTypes = {
  type: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  selectRow: React.PropTypes.func.isRequired,
  patterns: React.PropTypes.string.isRequired,
};

export default SelectStopRow;
