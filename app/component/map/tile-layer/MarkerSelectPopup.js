import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import SelectStopRow from './SelectStopRow';
import SelectVehicleRentalStationRow from './SelectVehicleRentalStationRow';
import SelectParkAndRideRow from './SelectParkAndRideRow';
import SelectVehicleContainer from './SelectVehicleContainer';
import { popupColorShape } from '../../../util/shapes';

function MarkerSelectPopup(props) {
  const hasStop = () =>
    props.options.find(option => option.layer !== 'realTimeVehicle');

  const hasVehicle = () =>
    props.options.find(option => option.layer === 'realTimeVehicle');

  const getRowForParking = (parking, layer) =>
    ((layer === 'parkAndRide' && parking.carPlaces) ||
      (layer === 'parkAndRideForBikes' && parking.bicyclePlaces)) && (
      <SelectParkAndRideRow
        key={parking.id}
        name={parking.name}
        carParkId={layer === 'parkAndRide' ? parking.id : undefined}
        bikeParkId={layer === 'parkAndRideForBikes' ? parking.id : undefined}
      />
    );

  const rows = props.options.map(option => {
    if (option.layer === 'stop') {
      return (
        <SelectStopRow
          terminal={!!option.feature.properties.stops}
          {...option.feature.properties}
          key={option.feature.properties.gtfsId}
          colors={props.colors}
          routes={option.feature.properties.routes}
          platform={option.feature.properties.platform}
        />
      );
    }
    if (option.layer === 'citybike') {
      return (
        <SelectVehicleRentalStationRow
          {...option.feature.properties}
          key={`citybike:${option.feature.properties.id}`}
        />
      );
    }

    if (
      option.layer === 'parkAndRide' ||
      option.layer === 'parkAndRideForBikes'
    ) {
      if (option.feature.properties.vehicleParking) {
        const { vehicleParking } = option.feature.properties;
        if (Array.isArray(vehicleParking) && vehicleParking.length > 0) {
          return (
            <React.Fragment key="parkAndRideOptions">
              {vehicleParking.map(parking => {
                return getRowForParking(parking, option.layer);
              })}
            </React.Fragment>
          );
        }
      } else {
        return getRowForParking(option.feature.properties, option.layer);
      }
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
  options: PropTypes.arrayOf(
    PropTypes.shape({
      layer: PropTypes.string,
    }),
  ).isRequired,
  selectRow: PropTypes.func.isRequired,
  colors: popupColorShape.isRequired,
};

export default MarkerSelectPopup;
