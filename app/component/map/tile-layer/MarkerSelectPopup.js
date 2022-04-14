import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import SelectStopRow from './SelectStopRow';
import SelectCityBikeRow from './SelectCityBikeRow';
import SelectParkAndRideRow from './SelectParkAndRideRow';
import SelectVehicleContainer from './SelectVehicleContainer';

function MarkerSelectPopup(props) {
  const hasStop = () =>
    props.options.find(option => option.layer !== 'realTimeVehicle');

  const hasVehicle = () =>
    props.options.find(option => option.layer === 'realTimeVehicle');

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
          colors={props.colors}
        />
      );
    }
    if (option.layer === 'stop') {
      return (
        <SelectStopRow
          gtfsId={option.feature.properties.gtfsId}
          code={option.feature.properties.code || null}
          name={option.feature.properties.name}
          type={option.feature.properties.type}
          key={option.feature.properties.gtfsId}
          desc={option.feature.properties.desc}
          colors={props.colors}
        />
      );
    }
    if (option.layer === 'citybike') {
      return (
        <SelectCityBikeRow
          {...option.feature.properties}
          key={`citybike:${option.feature.properties.id}`}
          name={option.feature.properties.name}
          desc={option.feature.properties.desc}
        />
      );
    }
    if (
      option.layer === 'parkAndRide' ||
      option.layer === 'parkAndRideForBikes'
    ) {
      if (
        Array.isArray(option.feature.properties?.facilities) &&
        option.feature.properties.facilities.length > 0
      ) {
        return (
          <>
            {option.feature.properties.facilities.map(facility => {
              return (
                <SelectParkAndRideRow
                  key={facility.id}
                  name={facility.name}
                  bikeParkId={facility?.bikeParkId}
                  carParkId={facility?.carParkId}
                />
              );
            })}
          </>
        );
      }
      return (
        <SelectParkAndRideRow
          key={option.feature.properties.facility.id}
          name={option.feature.properties.facility.name}
          bikeParkId={option.feature.properties.facility?.bikeParkId}
          carParkId={option.feature.properties.facility?.carParkId}
        />
      );
    }
    if (option.layer === 'realTimeVehicle') {
      return (
        <SelectVehicleContainer
          vehicle={option.feature.vehicle}
          key={option.feature.vehicle.tripId || option.feature.vehicle.id}
          rowView
        />
      );
    }
    return null;
  });
  let id = 'choose-stop';
  if (hasStop() && hasVehicle()) {
    id = 'choose-stop-or-vehicle';
  }

  if (!hasStop() && hasVehicle()) {
    id = 'choose-vehicle';
  }

  return (
    <div className="card marker-select-popup">
      <h3 className="stop-popup-choose-header">
        <FormattedMessage id={id} defaultMessage="Choose stop" />
      </h3>
      <hr className="no-margin gray" />
      <div className="scrollable momentum-scroll card-row select-scroll-container">
        {rows}
      </div>
    </div>
  );
}

MarkerSelectPopup.displayName = 'MarkerSelectPopup';

MarkerSelectPopup.propTypes = {
  options: PropTypes.array.isRequired,
  selectRow: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  colors: PropTypes.object.isRequired,
};

export default MarkerSelectPopup;
