import React from 'react';
import { configShape } from '../../../util/shapes';
import TileLayerContainer from './TileLayerContainer';
import VehicleRentalStations from './VehicleRentalStations';
import Stops from './Stops';
import ParkAndRideForCars from './ParkAndRideForCars';
import ParkAndRideForBikes from './ParkAndRideForBikes';
import { mapLayerShape } from '../../../store/MapLayerStore';
import RentalVehicles from './RentalVehicles';
import AreaStops from './AreaStops';

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
