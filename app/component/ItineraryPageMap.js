import PropTypes from 'prop-types';
import React from 'react';
import some from 'lodash/some';
import polyline from 'polyline-encoded';

import LocationMarker from './map/LocationMarker';
import ItineraryLine from './map/ItineraryLine';
import Map from './map/Map';
import Icon from './Icon';
import { otpToLocation } from '../util/otpStrings';
import { isBrowser } from '../util/browser';

let L;

if (isBrowser) {
  // eslint-disable-next-line
  L = require('leaflet');
}

let timeout;

export default function ItineraryPageMap(
  { itinerary, params, from, to, routes, center },
  { breakpoint, router, location },
) {
  const leafletObjs = [
    <LocationMarker
      key="fromMarker"
      position={from || otpToLocation(params.from)}
      className="from"
    />,
    <LocationMarker
      key="toMarker"
      position={to || otpToLocation(params.to)}
      className="to"
    />];

  if (location.query && location.query.intermediatePlaces) {
    if (Array.isArray(location.query.intermediatePlaces)) {
      location.query.intermediatePlaces.map(otpToLocation).forEach((markerLocation, i) => {
        leafletObjs.push(
          <LocationMarker
            key={`via_${i}`} // eslint-disable-line react/no-array-index-key
            position={markerLocation}
            className="via"
            noText
          />,
          );
      });
    } else {
      leafletObjs.push(
        <LocationMarker
          key={'via'}
          position={otpToLocation(location.query.intermediatePlaces)}
          className="via"
          noText
        />,
        );
    }
  }

  if (itinerary) {
    leafletObjs.push(
      <ItineraryLine
        key={'line'}
        legs={itinerary.legs}
        showTransferLabels
        showIntermediateStops
      />,
    );
  }
  const fullscreen = some(routes.map(route => route.fullscreenMap));

  const toggleFullscreenMap = fullscreen ?
    router.goBack :
        () => router.push({
          ...location,
          pathname: `${location.pathname}/kartta`,
        });

  const overlay = fullscreen ? undefined : (
    <div
      className="map-click-prevent-overlay"
      onClick={toggleFullscreenMap}
    />);

  let bounds;

  if (!center && itinerary && !itinerary.legs[0].transitLeg) {
    bounds = polyline.decode(itinerary.legs[0].legGeometry.points);
  }

  const showScale = fullscreen || breakpoint === 'large';

// onCenterMap() used to check if the layer has a marker for an itinerary
// stop, emulate a click on the map to open up the popup
  const onCenterMap = (element) => {
    if (!element || !center) {
      return;
    }
    element.map.leafletElement.closePopup();
    clearTimeout(timeout);
    if (fullscreen || breakpoint === 'large') {
      const latlngPoint = new L.LatLng(center.lat, center.lon);
      element.map.leafletElement.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer.getLatLng().equals(latlngPoint)) {
          timeout = setTimeout(() => layer.fireEvent('click', {
            latlng: latlngPoint,
            layerPoint: element.map.leafletElement.latLngToLayerPoint(latlngPoint),
            containerPoint: element.map.leafletElement.latLngToContainerPoint(latlngPoint),
          }), 250);
          // Timout duration comes from
          // https://github.com/Leaflet/Leaflet/blob/v1.1.0/src/dom/PosAnimation.js#L35
        }
      });
    }
  };

  return (
    <Map
      className="full itinerary"
      leafletObjs={leafletObjs}
      lat={center ? center.lat : from.lat}
      lon={center ? center.lon : from.lon}
      zoom={bounds ? undefined : 16}
      bounds={bounds}
      fitBounds={Boolean(bounds)}
      boundsOptions={{ maxZoom: 16 }}
      showScaleBar={showScale}
      ref={onCenterMap}
      hideOrigin
    >
      {breakpoint !== 'large' && overlay}
      {breakpoint !== 'large' && (
        <div
          className="fullscreen-toggle"
          onClick={toggleFullscreenMap}
        >
          <Icon
            img="icon-icon_maximize"
            className="cursor-pointer"
          />
        </div>
      )}
    </Map>
  );
}

ItineraryPageMap.propTypes = {
  itinerary: PropTypes.object,
  params: PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
  }).isRequired,
  from: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
  to: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }),
  routes: PropTypes.arrayOf(PropTypes.shape({
    fullscreenMap: PropTypes.bool,
  }).isRequired).isRequired,
};
