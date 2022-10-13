import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import SelectStopRow from './SelectStopRow';
import SelectCityBikeRow from './SelectCityBikeRow';
import SelectParkAndRideRow from './SelectParkAndRideRow';
import SelectVehicleContainer from './SelectVehicleContainer';
import SelectCarpoolRow from './SelectCarpoolRow';
import SelectRoadworksRow from './SelectRoadworksRow';
import SelectChargingStationRow from './SelectChargingStationRow';
import SelectDatahubPoiRow from './SelectDatahubPoiRow';

function MarkerSelectPopup(props) {
  const hasStop = () =>
    props.options.find(option => option.layer !== 'realTimeVehicle');

  const hasVehicle = () =>
    props.options.find(option => option.layer === 'realTimeVehicle');

  const rows = props.options.map(option => {
    if (option.layer === 'datahubTiles') {
      const { lat, lon } = option.coords;
      return (
        <SelectDatahubPoiRow
          datahubId={option.feature.properties.datahub_id}
          name={option.feature.properties.name}
          description={option.feature.properties.tag_name}
          latitude={lat}
          longitude={lon}
          // todo: use option.feature.properties.svg_icon?
          icon={option.layerConfig.icon}
        />
      );
    }

    if (option.layer === 'stop') {
      return (
        <SelectStopRow
          terminal={!!option.feature.properties.stops}
          {...option.feature.properties}
          key={option.feature.properties.gtfsId}
          colors={props.colors}
        />
      );
    }
    if (option.layer === 'citybike') {
      return (
        <SelectCityBikeRow
          {...option.feature.properties}
          key={`citybike:${option.feature.properties.id}`}
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
    if (option.layer === 'carpool') {
      return (
        <SelectCarpoolRow
          {...option.feature}
          key={option.feature.properties.name}
        />
      );
    }
    if (option.layer === 'roadworks') {
      return (
        <SelectRoadworksRow
          {...option.feature}
          key={option.feature.properties.id}
        />
      );
    }

    if (option.layer === 'chargingStations') {
      return (
        <SelectChargingStationRow
          {...option.feature}
          key={option.feature.properties.id}
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
