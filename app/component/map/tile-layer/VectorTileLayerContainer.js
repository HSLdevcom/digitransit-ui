import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import TileLayerContainer from './TileLayerContainer';
import CityBikes from './CityBikes';
import DynamicParkingLots from './DynamicParkingLots';
import WeatherStations from './WeatherStations';
import Stops from './Stops';
import ParkAndRide from './ParkAndRide';
import Roadworks from './Roadworks';

export default function VectorTileLayerContainer(props, { config }) {
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    const layersToAdd = [];
    if (props.showStops) {
      layersToAdd.push(Stops);
      if (config.cityBike && config.cityBike.showCityBikes) {
        layersToAdd.push(CityBikes);
      }

      if (
        config.parkAndRide &&
        config.parkAndRide.showParkAndRide &&
        !props.disableParkAndRide
      ) {
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
    }
  }, [props, config]);

  return (
    <TileLayerContainer
      key="tileLayer"
      pane="markerPane"
      layers={layers}
      stopsNearYouMode={props.stopsNearYouMode}
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
  hilightedStops: PropTypes.arrayOf(PropTypes.string),
  stopsToShow: PropTypes.arrayOf(PropTypes.string),
  disableMapTracking: PropTypes.func,
  showStops: PropTypes.bool,
  stopsNearYouMode: PropTypes.string,
  locationPopup: PropTypes.string,
  onSelectLocation: PropTypes.func,
  disableParkAndRide: PropTypes.bool,
};

VectorTileLayerContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};
