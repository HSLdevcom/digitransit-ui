import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import LocationMarker from './LocationMarker';
import ItineraryLine from './ItineraryLine';
import MapContainer from './MapContainer';
import { otpToLocation } from '../../util/otpStrings';
import { isBrowser } from '../../util/browser';
import { dtLocationShape } from '../../util/shapes';
import { onLocationPopup } from '../../util/queryUtils';
import withBreakpoint from '../../util/withBreakpoint';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer'; // DT-3473
import { mapLayerShape } from '../../store/MapLayerStore';

let L;
let prevCenter;
let useCenter = true;
let zoomLevel = -1;

if (isBrowser) {
  // eslint-disable-next-line
  L = require('leaflet');
}

function setMapElementRef(element) {
  const map = get(element, 'leafletElement', null);
  if (map) {
    // eslint-disable-next-line no-underscore-dangle
    zoomLevel = map._zoom;
  }
}

function ItineraryPageMap(
  {
    itinerary,
    center,
    breakpoint,
    fitBounds,
    bounds,
    leafletEvents,
    showVehicles,
    mapLayers,
  },
  { match, router, executeAction },
) {
  // DT-4011: When user changes orientation, i.e. with tablet, map would crash. This check prevents it.
  let latlon = prevCenter;
  const { from, to, hash } = match.params;
  if (prevCenter) {
    useCenter = false;
  }
  if (center && !isEqual(center, prevCenter)) {
    latlon = center;
    prevCenter = center;
    useCenter = true;
  }
  const leafletObjs = [
    <LocationMarker
      key="fromMarker"
      position={otpToLocation(from)}
      type="from"
      streetMode={match.params.hash}
    />,
    <LocationMarker
      key="toMarker"
      position={otpToLocation(to)}
      type="to"
      streetMode={match.params.hash}
    />,
  ];
  if (
    hash !== undefined &&
    hash !== 'walk' &&
    hash !== 'bike' &&
    showVehicles
  ) {
    leafletObjs.push(<VehicleMarkerContainer key="vehicles" useLargeIcon />);
  }
  if (match.location.query && match.location.query.intermediatePlaces) {
    if (Array.isArray(match.location.query.intermediatePlaces)) {
      match.location.query.intermediatePlaces
        .map(otpToLocation)
        .forEach((markerLocation, i) => {
          leafletObjs.push(
            <LocationMarker
              key={`via_${i}`} // eslint-disable-line react/no-array-index-key
              position={markerLocation}
            />,
          );
        });
    } else {
      leafletObjs.push(
        <LocationMarker
          key="via"
          position={otpToLocation(match.location.query.intermediatePlaces)}
        />,
      );
    }
  }

  if (itinerary) {
    leafletObjs.push(
      <ItineraryLine
        key="line"
        legs={itinerary.legs}
        showTransferLabels
        showIntermediateStops
        streetMode={match.params.hash}
      />,
    );
  }

  if (!center && itinerary && !itinerary.legs[0].transitLeg) {
    // bounds = polyline.decode(itinerary.legs[0].legGeometry.points);
  }

  const onSelectLocation = (item, id) =>
    onLocationPopup(item, id, router, match, executeAction);

  const validCenter = latlon && latlon.lat !== undefined;
  // eslint-disable-next-line no-nested-ternary
  const lat = validCenter ? latlon.lat : undefined;
  // eslint-disable-next-line no-nested-ternary
  const lon = validCenter ? latlon.lon : undefined;
  const send = useCenter;

  let useFitBound = fitBounds;
  if (bounds?.length === undefined) {
    useFitBound = false;
  }

  return (
    <MapContainer
      className="full itinerary"
      leafletObjs={leafletObjs}
      lat={send ? lat : undefined}
      lon={send ? lon : undefined}
      zoom={bounds ? undefined : 16}
      bounds={bounds}
      fitBounds={useFitBound}
      boundsOptions={{ maxZoom: 16 }}
      locationPopup="all"
      leafletEvents={leafletEvents}
      geoJsonZoomLevel={zoomLevel}
      mapRef={setMapElementRef}
      onSelectLocation={onSelectLocation}
      mapLayers={mapLayers}
    >
      {breakpoint !== 'large' && (
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          fallback="pop"
        />
      )}
    </MapContainer>
  );
}

ItineraryPageMap.propTypes = {
  itinerary: PropTypes.object,
  center: dtLocationShape,
  breakpoint: PropTypes.string.isRequired,
  bounds: PropTypes.array,
  fitBounds: PropTypes.bool,
  leafletEvents: PropTypes.object,
  showVehicles: PropTypes.bool,
  mapLayers: mapLayerShape.isRequired,
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.object,
  executeAction: PropTypes.func.isRequired,
};

export default withBreakpoint(ItineraryPageMap);
