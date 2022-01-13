import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import TileLayerContainer from './TileLayerContainer';
import CityBikes from './CityBikes';
import DynamicParkingLots from './DynamicParkingLots';
import WeatherStations from './WeatherStations';
import DatahubTiles from './DatahubTiles';
import Stops from './Stops';
import ParkAndRide from './ParkAndRide';
import BikeParks from './BikeParks';
import Roadworks from './Roadworks';
import ChargingStations from './ChargingStations';
import { mapLayerShape } from '../../../store/MapLayerStore';
import Loading from '../../Loading';

export default function VectorTileLayerContainer(props, { config }) {
  const [layers, setLayers] = useState([]);
  const [mapLayers, setMapLayers] = useState([]);

  useEffect(() => {
    const layersToAdd = [];

    layersToAdd.push(Stops);
    if (props.mapLayers.citybike) {
      layersToAdd.push(CityBikes);
    }

    if (config.bikeParks && config.bikeParks.show) {
      layersToAdd.push(BikeParks);
    }
    if (props.mapLayers.parkAndRide) {
      layersToAdd.push(ParkAndRide);
    }

    if (
      config.dynamicParkingLots &&
      config.dynamicParkingLots.showDynamicParkingLots
    ) {
      layersToAdd.push(DynamicParkingLots);
    }

    if (config.weatherStations && config.weatherStations.show) {
      layersToAdd.push(WeatherStations);
    }

    if (config.datahubTiles && config.datahubTiles.show) {
      layersToAdd.push(DatahubTiles);
    }

    if (config.chargingStations && config.chargingStations.show) {
      layersToAdd.push(ChargingStations);
    }

    if (config.roadworks && config.roadworks.showRoadworks) {
      layersToAdd.push(Roadworks);
    }

    setLayers(layersToAdd);
    // For some reason this is needed, to release deep object references and update map layers properly.
    setMapLayers(JSON.parse(JSON.stringify(props.mapLayers)));
  }, [props, config]);

  return layers.length !== 0 ? (
    <TileLayerContainer
      key="tileLayer"
      pane="markerPane"
      layers={layers}
      mapLayers={mapLayers}
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
