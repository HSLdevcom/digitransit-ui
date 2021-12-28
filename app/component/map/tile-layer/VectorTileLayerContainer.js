import PropTypes from 'prop-types';
import React from 'react';

import TileLayerContainer from './TileLayerContainer';
import CityBikes from './CityBikes';
import Stops from './Stops';
import ParkAndRide from './ParkAndRide';
import ParkAndRideForBikes from './ParkAndRideForBikes';
import { mapLayerShape } from '../../../store/MapLayerStore';

export default function VectorTileLayerContainer(props, { config }) {
  const layers = [];

  layers.push(Stops);

  if (props.mapLayers.citybike) {
    layers.push(CityBikes);
  }
  if (props.mapLayers.parkAndRide) {
    layers.push(ParkAndRide);
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
