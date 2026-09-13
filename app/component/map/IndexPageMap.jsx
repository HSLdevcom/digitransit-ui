import React from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape } from 'found';
import MapWithTracking from './MapWithTracking.jsx';
import { sameLocations } from '../../util/path.js';
import OriginStore from '../../store/OriginStore.js';
import DestinationStore from '../../store/DestinationStore.js';
import { configShape, locationShape } from '../../util/shapes.js';
import storeOrigin from '../../action/originActions.js';
import storeDestination from '../../action/destinationActions.js';
// eslint-disable-next-line import/no-named-as-default
import { mapLayerShape } from '../../store/MapLayerStore.js';
import CookieSettingsButton from '../CookieSettingsButton.jsx';
import LocationMarker from './LocationMarker.jsx';

let focus = {};
const mwtProps = {};

function IndexPageMap(
  { match, origin, destination, mapLayers },
  { config, executeAction },
) {
  let newFocus = {};
  let zoom = 16;

  if (origin.lat) {
    newFocus = origin;
  } else if (destination.lat) {
    newFocus = destination;
  } else if (!match.params.from && !match.params.to) {
    // use default location only if url does not include location
    newFocus = config.defaultEndpoint;
    zoom = config.defaultMapZoom;
  }

  if (!sameLocations(focus, newFocus) && newFocus.lat) {
    // feed in new props to map
    if (newFocus.type === 'CurrentLocation') {
      mwtProps.mapTracking = true;
    } else {
      mwtProps.mapTracking = false;
    }
    mwtProps.zoom = zoom;
    mwtProps.lat = newFocus.lat;
    mwtProps.lon = newFocus.lon;
    focus = { ...newFocus };
  } else {
    delete mwtProps.mapTracking;
  }

  const leafletObjs = [];

  if (origin.lat) {
    leafletObjs.push(
      <LocationMarker
        key={`${origin.lat},${origin.lon}`}
        position={origin}
        type="from"
      />,
    );
  }

  if (destination.lat) {
    leafletObjs.push(
      <LocationMarker
        key={`${destination.lat},${destination.lon}`}
        position={destination}
        type="to"
      />,
    );
  }

  const selectLocation = (item, id) => {
    if (id === 'origin') {
      executeAction(storeOrigin, item);
    } else {
      executeAction(storeDestination, item);
    }
  };

  return (
    <>
      {config.useCookiesPrompt && <CookieSettingsButton />}
      <MapWithTracking
        {...mwtProps}
        mapLayers={mapLayers}
        leafletObjs={leafletObjs}
        locationPopup="origindestination"
        onSelectLocation={selectLocation}
        vehicles
      />
    </>
  );
}

IndexPageMap.propTypes = {
  match: matchShape.isRequired,
  origin: locationShape,
  destination: locationShape,
  mapLayers: mapLayerShape.isRequired,
};

IndexPageMap.defaultProps = {
  origin: {},
  destination: {},
};

IndexPageMap.contextTypes = {
  config: configShape.isRequired,
  executeAction: PropTypes.func.isRequired,
};

const IndexPageMapWithStores = connectToStores(
  IndexPageMap,
  [OriginStore, DestinationStore, 'MapLayerStore'],
  ({ getStore }) => {
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();

    return {
      origin,
      destination,
      mapLayers: getStore('MapLayerStore').getMapLayers(),
    };
  },
);

export { IndexPageMapWithStores as default, IndexPageMap as Component };
