import React from 'react';
import { useMatch } from 'found';
import MapWithTracking from './MapWithTracking';
import { sameLocations } from '../../../utils/shared/path';
import { useConfigContext } from '../../client/ConfigContext';
import { useMapLayers } from '../../hooks/MapLayerContext';
import CookieSettingsButton from '../CookieSettingsButton';
import LocationMarker from './LocationMarker';
import {
  useOrigin,
  useDestination,
  useItineraryLocationActions,
} from '../../hooks/ItineraryLocationContext';

let focus = {};
const mwtProps = {};

function IndexPageMap() {
  const config = useConfigContext();
  const { mapLayers } = useMapLayers();
  const match = useMatch();
  const origin = useOrigin();
  const destination = useDestination();
  const { setOrigin, setDestination } = useItineraryLocationActions();
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
      setOrigin(item);
    } else {
      setDestination(item);
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

export default IndexPageMap;
