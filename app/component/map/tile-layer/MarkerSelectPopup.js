import React from 'react';
import SelectStopRow from './select-stop-row';
import SelectCitybikeRow from './select-citybike-row';

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
        <SelectCitybikeRow
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

MarkerSelectPopup.propTypes = {
  options: React.PropTypes.object.isRequired,
  selectRow: React.PropTypes.func.isRequired,
};

export default MarkerSelectPopup;
