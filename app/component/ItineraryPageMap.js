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
let msg = false;
if (isBrowser) {
  // eslint-disable-next-line
  L = require('leaflet');
}
// When user goes straigth to itinerary view with url, map cannot keep up and renders a while after everything else
// This helper function ensures that lat lon values are sent to the map, thus preventing set center and zoom first error.
function received() {
  msg = true;
}
function ItineraryPageMap(
  { itinerary, center, breakpoint, forceCenter, fitBounds, bounds, streetMode },
  { match, config },
) {
  const { from, to } = match.params;
  if (prevCenter) {
    useCenter = false;
  }
  if (center && (!isEqual(center, prevCenter) || forceCenter)) {
    prevCenter = center;
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
    <VehicleMarkerContainer key="vehicles" useLargeIcon />,
  ];
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
  const validCenter =
    center && (center.lat !== undefined || center[0] !== undefined);
  // eslint-disable-next-line no-nested-ternary
  const lat = validCenter ? (center.lat ? center.lat : center[0]) : undefined;
  // eslint-disable-next-line no-nested-ternary
  const lon = validCenter ? (center.lon ? center.lon : center[1]) : undefined;
  return (
    <MapContainer
      className="full itinerary"
      leafletObjs={leafletObjs}
      lat={useCenter || !msg ? lat : undefined}
      lon={useCenter || !msg ? lon : undefined}
      zoom={bounds ? 12 : 16}
      bounds={bounds}
      received={received}
      fitBounds={fitBounds}
      boundsOptions={{ maxZoom: 16 }}
      showScaleBar={showScale}
      hideOrigin
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
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.object,
};

export default withBreakpoint(ItineraryPageMap);
