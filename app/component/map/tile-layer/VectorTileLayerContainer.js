import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import TileLayerContainer from './TileLayerContainer';
import CityBikes from './CityBikes';
import DynamicParkingLots from './DynamicParkingLots';
import WeatherStations from './WeatherStations';
import Stops from './Stops';
import ParkAndRide from './ParkAndRide';
import BikeParks from './BikeParks';
import Roadworks from './Roadworks';
import { mapLayerShape } from '../../../store/MapLayerStore';

export default function VectorTileLayerContainer(props, { config }) {
  const [layers, setLayers] = useState([]);

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

    if (config.constructor && config.roadworks.showRoadworks) {
      layersToAdd.push(Roadworks);
    }
    setLayers(layersToAdd);
  }, [props, config]);

  return (
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
