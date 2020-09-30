import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
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

if (isBrowser) {
  // eslint-disable-next-line
  L = require('leaflet');
}

function ItineraryPageMap(
  { itinerary, center, breakpoint, bounds, streetMode },
  { match, config },
) {
  const { from, to } = match.params;

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

  return (
    <MapContainer
      className="full itinerary"
      leafletObjs={leafletObjs}
      lat={center ? center.lat : from.lat}
      lon={center ? center.lon : from.lon}
      zoom={bounds ? undefined : 16}
      bounds={bounds}
      fitBounds={Boolean(bounds)}
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
};

ItineraryPageMap.contextTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  config: PropTypes.object,
};

export default withBreakpoint(ItineraryPageMap);
