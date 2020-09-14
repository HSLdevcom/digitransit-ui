import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import SelectStopRow from './SelectStopRow';
import SelectTerminalRow from './SelectTerminalRow';
import SelectCityBikeRow from './SelectCityBikeRow';
import SelectParkAndRideRow from './SelectParkAndRideRow';
import SelectTicketSalesRow from './SelectTicketSalesRow';
import ComponentUsageExample from '../../ComponentUsageExample';
import MarkerPopupBottom from '../MarkerPopupBottom';
import { options } from '../../ExampleData';

function MarkerSelectPopup(props) {
  const rows = props.options.map(option => {
    if (option.layer === 'stop' && option.feature.properties.stops) {
      return (
        <SelectTerminalRow
          {...option.feature.properties}
          key={option.feature.properties.gtfsId}
          selectRow={() => props.selectRow(option)}
        />
      );
    }
    if (option.layer === 'stop') {
      return (
        <SelectStopRow
          {...option.feature.properties}
          key={option.feature.properties.gtfsId}
          selectRow={() => props.selectRow(option)}
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
    if (option.layer === 'ticketSales') {
      return (
        <SelectTicketSalesRow
          {...option.feature.properties}
          key={option.feature.properties.FID}
          selectRow={() => props.selectRow(option)}
        />
      );
    }
    return null;
  });

  return (
    <div className="card marker-select-popup">
      <h3 className="padding-normal gray">
        <FormattedMessage id="choose-stop" defaultMessage="Choose stop" />
      </h3>
      <hr className="no-margin gray" />
      <div className="scrollable momentum-scroll card-row">{rows}</div>
      <div>
        <MarkerPopupBottom
          location={{
            address:
              props.options[0].feature.properties.name ||
              props.options[0].feature.properties.Nimi,
            lat: props.location.lat,
            lon: props.location.lng,
          }}
        />
      </div>
    </div>
  );
}

MarkerSelectPopup.displayName = 'MarkerSelectPopup';

MarkerSelectPopup.description = (
  <div className="popup">
    <p>Renders a marker select popup</p>
    <ComponentUsageExample description="">
      <MarkerSelectPopup
        options={options}
        selectRow={() => {}}
        location={{
          lat: 60.169522909062366,
          lng: 24.933385848999027,
          address: 'Kamppi (kaukoliikenneterminaali)',
        }}
      />
    </ComponentUsageExample>
  </div>
);

MarkerSelectPopup.propTypes = {
  options: PropTypes.array.isRequired,
  selectRow: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  location: PropTypes.object.isRequired,
};

export default MarkerSelectPopup;
