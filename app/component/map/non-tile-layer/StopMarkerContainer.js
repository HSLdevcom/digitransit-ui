import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';

import StopMarkerLayer from './StopMarkerLayer';
import StopMarkerLayerRoute from '../../../route/StopMarkerLayerRoute';

export default function StopMarkerContainer(
  { hilightedStops },
  { map, config },
) {
  let bounds;
  let maxLon;
  let maxLat;
  let minLon;
  let minLat;

  if (map.getZoom() < config.stopsMinZoom) {
    minLat = 0.1;
    minLon = 0.1;
    maxLat = 0.1;
    maxLon = 0.1;
  } else {
    bounds = map.getBounds();
    minLat = bounds.getSouth();
    minLon = bounds.getWest();
    maxLat = bounds.getNorth();
    maxLon = bounds.getEast();
  }

  return (
    <Relay.RootContainer
      Component={StopMarkerLayer}
      route={
        new StopMarkerLayerRoute({
          minLat,
          minLon,
          maxLat,
          maxLon,
          agency: config.preferredAgency || null,
        })
      }
      renderFetched={data =>
        <StopMarkerLayer
          {...data}
          hilightedStops={hilightedStops}
          minLat={minLat}
          minLon={minLon}
          maxLat={maxLat}
          maxLon={maxLon}
          agency={config.preferredAgency || null}
        />}
    />
  );
}

StopMarkerContainer.propTypes = {
  hilightedStops: PropTypes.array,
};

StopMarkerContainer.contextTypes = {
  map: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
};
