import React from 'react';
import some from 'lodash/some';
import polyline from 'polyline-encoded';

import LocationMarker from './map/LocationMarker';
import ItineraryLine from './map/ItineraryLine';
import Map from './map/Map';
import Icon from './Icon';
import { otpToLocation } from '../util/otpStrings';

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
  itinerary: React.PropTypes.object,
  params: React.PropTypes.shape({
    from: React.PropTypes.string.isRequired,
    to: React.PropTypes.string.isRequired,
  }).isRequired,
  from: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }),
  to: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }),
  center: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }),
  routes: React.PropTypes.arrayOf(React.PropTypes.shape({
    fullscreenMap: React.PropTypes.bool,
  }).isRequired).isRequired,
};
