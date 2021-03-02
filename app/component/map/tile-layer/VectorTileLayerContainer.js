import PropTypes from 'prop-types';
import React from 'react';

import TileLayerContainer from './TileLayerContainer';
import CityBikes from './CityBikes';
import Stops from './Stops';
import ParkAndRide from './ParkAndRide';

export default function VectorTileLayerContainer(props, { config }) {
  const layers = [];
  if (props.showStops) {
    layers.push(Stops);
    if (config.cityBike && config.cityBike.showCityBikes) {
      layers.push(CityBikes);
    }

    if (
      config.parkAndRide &&
      config.parkAndRide.showParkAndRide &&
      !props.disableParkAndRide
    ) {
      layers.push(ParkAndRide);
    }
  }

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
