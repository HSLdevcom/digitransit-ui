import React from 'react';
import { configShape } from '../../../util/shapes.js';
import TileLayerContainer from './TileLayerContainer.jsx';
import VehicleRentalStations from './VehicleRentalStations.js';
import Stops from './Stops.js';
import ParkAndRideForCars from './ParkAndRideForCars.js';
import ParkAndRideForBikes from './ParkAndRideForBikes.js';
import { mapLayerShape } from '../../../store/MapLayerStore.js';
import RentalVehicles from './RentalVehicles.js';
import AreaStops from './AreaStops.js';

export default function VectorTileLayerContainer(
  { mapLayers, ...rest },
  { config },
) {
  const layers = [];

  layers.push(Stops);

  if (mapLayers.citybike) {
    layers.push(VehicleRentalStations);
  }
  if (mapLayers.parkAndRide) {
    layers.push(ParkAndRideForCars);
  }
  if (mapLayers.parkAndRideForBikes) {
    layers.push(ParkAndRideForBikes);
  }
  if (mapLayers.scooter) {
    layers.push(RentalVehicles);
  }
  if (mapLayers.areaStop?.routeGtfsId) {
    layers.push(AreaStops);
  }
  return (
    <TileLayerContainer
      key="tileLayer"
      pane="markerPane"
      layers={layers}
      mapLayers={mapLayers}
      tileSize={config.map.tileSize || 256}
      zoomOffset={config.map.zoomOffset || 0}
      {...rest}
    />
  );
}

VectorTileLayerContainer.propTypes = {
  mapLayers: mapLayerShape.isRequired,
};

VectorTileLayerContainer.contextTypes = {
  config: configShape.isRequired,
};
