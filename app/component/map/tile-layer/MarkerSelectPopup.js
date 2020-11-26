import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import SelectStopRow from './SelectStopRow';
import SelectCityBikeRow from './SelectCityBikeRow';
import SelectParkAndRideRow from './SelectParkAndRideRow';
import ComponentUsageExample from '../../ComponentUsageExample';
import { options } from '../../ExampleData';
import SelectCarpoolRow from './SelectCarpoolRow';
import SelectDynamicParkingLotsRow from './SelectDynamicParkingLotsRow';

function MarkerSelectPopup(props) {
  const rows = props.options.map(option => {
    if (option.layer === 'stop' && option.feature.properties.stops) {
      return (
        <SelectStopRow
          terminal
          gtfsId={option.feature.properties.gtfsId}
          code={option.feature.properties.code || null}
          name={option.feature.properties.name}
          type={option.feature.properties.type}
          key={option.feature.properties.gtfsId}
          desc={option.feature.properties.desc}
        />
      );
    }
    if (
      option.layer === 'stop' &&
      (option.feature.properties.name.indexOf('P+M') !== -1 ||
        option.feature.properties.type !== 'CARPOOL')
    ) {
      return (
        <SelectStopRow
          gtfsId={option.feature.properties.gtfsId}
          code={option.feature.properties.code || null}
          name={option.feature.properties.name}
          type={option.feature.properties.type}
          key={option.feature.properties.gtfsId}
          desc={option.feature.properties.desc}
        />
      );
    }
    if (option.layer === 'citybike') {
      return (
        <SelectCityBikeRow
          {...option.feature.properties}
          key={`citybike:${option.feature.properties.id}`}
          selectRow={() => props.selectRow(option)}
        />
      );
    }
    if (option.layer === 'parkAndRide') {
      return (
        <SelectParkAndRideRow
          {...option.feature.properties}
          key={option.feature.properties.carParkId}
          selectRow={() => props.selectRow(option)}
        />
      );
    }
    if (option.layer === 'carpool') {
      return (
        <SelectCarpoolRow
          {...option.feature}
          key={option.feature.properties.name}
          selectRow={() => props.selectRow(option)}
        />
      );
    }
    if (option.layer === 'dynamicParkingLots') {
      return (
        <SelectDynamicParkingLotsRow
          {...option.feature}
          key={option.feature.properties.name}
          selectRow={() => props.selectRow(option)}
        />
      );
    }
    return null;
  });

  return (
    <div className="card marker-select-popup">
      <h3 className="stop-popup-choose-header">
        <FormattedMessage id="choose-stop" defaultMessage="Choose stop" />
      </h3>
      <hr className="no-margin gray" />
      <div className="scrollable momentum-scroll card-row select-scroll-container">
        {rows}
      </div>
    </div>
  );
}

MarkerSelectPopup.displayName = 'MarkerSelectPopup';

MarkerSelectPopup.description = (
  <div className="popup">
    <p>Renders a marker select popup</p>
    <ComponentUsageExample description="">
      <MarkerSelectPopup options={options} selectRow={() => {}} />
    </ComponentUsageExample>
  </div>
);

MarkerSelectPopup.propTypes = {
  options: PropTypes.array.isRequired,
  selectRow: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
};

export default MarkerSelectPopup;
