import React from 'react';
import SelectStopRow from './SelectStopRow';
import SelectCityBikeRow from './SelectCityBikeRow';
import ComponentUsageExample from '../../documentation/ComponentUsageExample';
import { options as options } from '../../documentation/ExampleData';

import { FormattedMessage } from 'react-intl';

function MarkerSelectPopup(props) {
  const rows = props.options.map((option) => {
    if (option.layer === 'stop') {
      return (
        <SelectStopRow
          {...option.feature.properties}
          key={option.feature.properties.gtfsId}
          selectRow={() => props.selectRow(option)}
        />
      );
    } else if (option.layer === 'citybike') {
      return (
        <SelectCityBikeRow
          {...option.feature.properties}
          key={option.feature.properties.stationId}
          selectRow={() => props.selectRow(option)}
        />
      );
    }
    return null;
  });

  return (
    <div className="card">
      <h3 className="padding-normal">
        <FormattedMessage id="choose-stop" defaultMessage="Choose stop" />
      </h3>
      {rows}
    </div>
  );
}

MarkerSelectPopup.displayName = 'MarkerSelectPopup';

MarkerSelectPopup.description = (
  <div>
    <p>Renders a marker select popup</p>
    <ComponentUsageExample description="">
      <MarkerSelectPopup
        options={options}
        selectRow={() => {}}
      />
    </ComponentUsageExample>
  </div>
);

MarkerSelectPopup.propTypes = {
  options: React.PropTypes.array.isRequired,
  selectRow: React.PropTypes.func.isRequired,
};

export default MarkerSelectPopup;
