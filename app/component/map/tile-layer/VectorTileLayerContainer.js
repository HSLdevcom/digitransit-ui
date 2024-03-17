import PropTypes from 'prop-types';
import React from 'react';
import { configShape } from '../../../util/shapes';
import TileLayerContainer from './TileLayerContainer';
import VehicleRentalStations from './VehicleRentalStations';
import Stops from './Stops';
import ParkAndRideForCars from './ParkAndRideForCars';
import ParkAndRideForBikes from './ParkAndRideForBikes';
import { mapLayerShape } from '../../../store/MapLayerStore';

export default function VectorTileLayerContainer(props, { config }) {
  const layers = [];

  layers.push(Stops);

  if (props.mapLayers.citybike) {
    layers.push(VehicleRentalStations);
  }
  if (props.mapLayers.parkAndRide) {
    layers.push(ParkAndRideForCars);
  }
  if (props.mapLayers.parkAndRideForBikes) {
    layers.push(ParkAndRideForBikes);
  }

  return (
    <TileLayerContainer
      key="tileLayer"
      pane="markerPane"
      layers={layers}
      mapLayers={props.mapLayers}
      mergeStops={props.mergeStops}
      hilightedStops={props.hilightedStops}
      stopsToShow={props.stopsToShow}
      objectsToHide={props.objectsToHide}
      tileSize={config.map.tileSize || 256}
      zoomOffset={config.map.zoomOffset || 0}
      locationPopup={props.locationPopup}
      onSelectLocation={props.onSelectLocation}
    />
  );
}

VectorTileLayerContainer.propTypes = {
  mapLayers: mapLayerShape.isRequired,
  hilightedStops: PropTypes.arrayOf(PropTypes.string),
  stopsToShow: PropTypes.arrayOf(PropTypes.string),
  objectsToHide: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
  mergeStops: PropTypes.bool,
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
};

VectorTileLayerContainer.defaultProps = {
  objectsToHide: { vehicleRentalStations: [] },
  hilightedStops: undefined,
  stopsToShow: undefined,
  mergeStops: false,
  onSelectLocation: undefined,
  locationPopup: undefined,
};

VectorTileLayerContainer.contextTypes = {
  config: configShape.isRequired,
};
