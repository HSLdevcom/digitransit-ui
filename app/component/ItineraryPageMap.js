import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import isEqual from 'lodash/isEqual';
import LocationMarker from './map/LocationMarker';
import ItineraryLine from './map/ItineraryLine';
import MapContainer from './map/MapContainer';
import { otpToLocation } from '../util/otpStrings';
import { isBrowser } from '../util/browser';
import { dtLocationShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';
import BackButton from './BackButton';
import VehicleMarkerContainer from './map/VehicleMarkerContainer'; // DT-3473

let L;
let prevCenter;
let useCenter = true;
let itineraryMapReady = false;
let breakpointChanged = false;
let prevBreakpoint;
if (isBrowser) {
  // eslint-disable-next-line
  L = require('leaflet');
}
function isItineraryMapReady(mapReady) {
  if (mapReady) {
    mapReady();
  }
  itineraryMapReady = true;
}
function ItineraryPageMap(
  {
    itinerary,
    center,
    mapReady,
    mapLoaded,
    breakpoint,
    forceCenter,
    fitBounds,
    bounds,
    streetMode,
    leafletEvents,
    boundsZoom,
    geoJsonZoomLevel,
    mapZoomLevel,
  },
  { match, config },
) {
  // DT-4011: When user changes orientation, i.e. with tablet, map would crash. This check prevents it.
  breakpointChanged = !isEqual(breakpoint, prevBreakpoint);
  prevBreakpoint = breakpoint;
  let latlon = prevCenter;
  const { from, to, hash } = match.params;
  if (prevCenter) {
    useCenter = false;
  }
  if (center && !isEqual(center, prevCenter)) {
    if (!mapLoaded) {
      if (center !== undefined) {
        latlon = center;
        prevCenter = center;
        useCenter = true;
      }
    } else {
      latlon = center;
      prevCenter = center;
      useCenter = true;
    }
  }
  if (forceCenter || breakpointChanged || !mapLoaded || !itineraryMapReady) {
    useCenter = true;
  }
  const leafletObjs = [
    <LocationMarker
      key="fromMarker"
      position={otpToLocation(from)}
      type="from"
      streetMode={streetMode}
    />,
    <LocationMarker
      key="toMarker"
      position={otpToLocation(to)}
      type="to"
      streetMode={streetMode}
    />,
  ];
  if (hash !== undefined && hash !== 'walk' && hash !== 'bike') {
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
        streetMode={streetMode}
      />,
    );
  }

  if (!center && itinerary && !itinerary.legs[0].transitLeg) {
    // bounds = polyline.decode(itinerary.legs[0].legGeometry.points);
  }

  const showScale = breakpoint === 'large';
  const validCenter = latlon && latlon.lat !== undefined;
  // eslint-disable-next-line no-nested-ternary
  const lat = validCenter ? latlon.lat : undefined;
  // eslint-disable-next-line no-nested-ternary
  const lon = validCenter ? latlon.lon : undefined;
  const send = useCenter; // || !mapLoaded || !itineraryMapReady;

  itineraryMapReady = false;

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
      mapReady={mapReady}
      itineraryMapReady={isItineraryMapReady}
      fitBounds={useFitBound}
      boundsOptions={{ maxZoom: 16 }}
      showScaleBar={showScale}
      hideOrigin
      locationPopup="all"
      leafletEvents={leafletEvents}
      boundsZoom={boundsZoom}
      geoJsonZoomLevel={geoJsonZoomLevel}
      mapZoomLevel={mapZoomLevel}
    >
      <BackButton
        icon="icon-icon_arrow-collapse--left"
        iconClassName="arrow-icon"
        color={config.colors.primary}
      />
    </MapContainer>
  );
}

ItineraryPageMap.propTypes = {
  itinerary: PropTypes.object,
  center: dtLocationShape,
  breakpoint: PropTypes.string.isRequired,
  bounds: PropTypes.array,
  streetMode: PropTypes.string,
  forceCenter: PropTypes.bool,
  fitBounds: PropTypes.bool,
  mapReady: PropTypes.func,
  mapLoaded: PropTypes.bool,
  leafletEvents: PropTypes.object,
  boundsZoom: PropTypes.number,
  geoJsonZoomLevel: PropTypes.number,
  mapZoomLevel: PropTypes.number,
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.object,
};

export default withBreakpoint(ItineraryPageMap);
