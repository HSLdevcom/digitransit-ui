import React from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape } from 'found';
import { intlShape } from 'react-intl';
import MapWithTracking from './MapWithTracking';
import { sameLocations } from '../../util/path';
import OriginStore from '../../store/OriginStore';
import DestinationStore from '../../store/DestinationStore';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { dtLocationShape } from '../../util/shapes';

import storeOrigin from '../../action/originActions';
import storeDestination from '../../action/destinationActions';
// eslint-disable-next-line import/no-named-as-default
import { mapLayerShape } from '../../store/MapLayerStore';

const locationMarkerModules = {
  LocationMarker: () =>
    importLazy(import(/* webpackChunkName: "map" */ './LocationMarker')),
};

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
    zoom = config.map?.zoom || 12;
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
      <LazilyLoad modules={locationMarkerModules} key="from">
        {({ LocationMarker }) => (
          <LocationMarker position={origin} type="from" />
        )}
      </LazilyLoad>,
    );
  }

  if (destination.lat) {
    leafletObjs.push(
      <LazilyLoad modules={locationMarkerModules} key="to">
        {({ LocationMarker }) => (
          <LocationMarker position={destination} type="to" />
        )}
      </LazilyLoad>,
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
  lang: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
  mapLayers: mapLayerShape.isRequired,
};

IndexPageMap.defaultProps = {
  origin: {},
  destination: {},
};

IndexPageMap.contextTypes = {
  config: PropTypes.object.isRequired,
  executeAction: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

const IndexPageMapWithStores = connectToStores(
  IndexPageMap,
  [OriginStore, DestinationStore, 'PreferencesStore', 'MapLayerStore'],
  ({ getStore }) => {
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();
    const lang = getStore('PreferencesStore').getLanguage();

    return {
      origin,
      destination,
      lang,
      mapLayers: getStore('MapLayerStore').getMapLayers(),
    };
  },
);

export { IndexPageMapWithStores as default, IndexPageMap as Component };
