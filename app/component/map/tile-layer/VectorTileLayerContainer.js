import PropTypes from 'prop-types';
import React from 'react';

import TileLayerContainer from './TileLayerContainer';
import BikeRentalStations from './BikeRentalStations';
import RentalVehicles from './RentalVehicles';
import WeatherStations from './WeatherStations';
import DatahubTiles from './DatahubTiles';
import Stops from './Stops';
import ParkAndRideForCars from './ParkAndRideForCars.bbnavi';
import ParkAndRideForBikes from './ParkAndRideForBikes.bbnavi';
import Roadworks from './Roadworks';
import ChargingStations from './ChargingStations';
import { mapLayerShape } from '../../../store/MapLayerStore';
import Loading from '../../Loading';

export default function VectorTileLayerContainer(props, { config }) {
  const layers = [];

  layers.push(Stops);

  if (props.mapLayers.citybike) {
    layers.push(BikeRentalStations);
    if (config.URL.RENTAL_VEHICLE_MAP) {
      layers.push(RentalVehicles);
    }
  }

  if (props.mapLayers.parkAndRide) {
    layers.push(ParkAndRideForCars);
  }
  if (props.mapLayers.parkAndRideForBikes) {
    layers.push(ParkAndRideForBikes);
  }

  if (props.mapLayers.weatherStations) {
    layers.push(WeatherStations);
  }

  if (props.mapLayers.datahubTiles) {
    config.datahubTiles.layers.forEach(layerConfig => {
      // Don't render tile layer if it isn't enabled.
      if (!props.mapLayers.datahubTiles[layerConfig.name]) {
        return;
      }

      // Technically, we just need to pass the layer's base URL into the instance.
      // To follow this code base's style, we use a "wrapper class" instead of a closure.
      class DatahubTilesWithLayer extends DatahubTiles {
        // eslint-disable-next-line no-shadow
        constructor(tile, config) {
          super(tile, layerConfig, config);
        }

        static getName = () => 'datahubTiles';

        // We need this as a static property so that `TileContainer` can check if
        // this layer is enabled *before* creating instances from the class.
        static layerConfig = layerConfig;
      }
      layers.push(DatahubTilesWithLayer);
    });
  }

  if (props.mapLayers.chargingStations) {
    layers.push(ChargingStations);
  }

  if (props.mapLayers.roadworks) {
    layers.push(Roadworks);
  }

  return layers.length !== 0 ? (
    <TileLayerContainer
      key="tileLayer"
      pane="markerPane"
      layers={layers}
      mapLayers={props.mapLayers}
      mergeStops={props.mergeStops}
      hilightedStops={props.hilightedStops}
      stopsToShow={props.stopsToShow}
      tileSize={config.map.tileSize || 256}
      zoomOffset={config.map.zoomOffset || 0}
      disableMapTracking={props.disableMapTracking}
      locationPopup={props.locationPopup}
      onSelectLocation={props.onSelectLocation}
    />
  ) : (
    <Loading />
  );
}

VectorTileLayerContainer.propTypes = {
  mapLayers: mapLayerShape.isRequired,
  hilightedStops: PropTypes.arrayOf(PropTypes.string),
  stopsToShow: PropTypes.arrayOf(PropTypes.string),
  disableMapTracking: PropTypes.func,
  mergeStops: PropTypes.bool,
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
};

VectorTileLayerContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};
