import React from 'react';
import some from 'lodash/some';
import polyline from 'polyline-encoded';

import LocationMarker from '../map/LocationMarker';
import ItineraryLine from '../map/ItineraryLine';
import Map from '../map/Map';
import Icon from '../icon/icon';


export default function ItineraryPageMap(
  { itinerary, from, to, routes, center },
  { breakpoint, router, location }
) {
  const leafletObjs = [
    <LocationMarker
      key="fromMarker"
      position={from}
      className="from"
    />,
    <LocationMarker
      key="toMarker"
      position={to}
      className="to"
    />];

  if (itinerary) {
    leafletObjs.push(
      <ItineraryLine
        key={'line'}
        legs={itinerary.legs}
        showTransferLabels
        showIntermediateStops
      />
    );
  }
  const fullscreen = some(routes.map(route => route.fullscreenMap));

  const toggleFullscreenMap = fullscreen ?
    router.goBack :
    () => router.push({
      pathname: `${location.pathname}/kartta`,
    });

  const overlay = fullscreen ? undefined : (
    <div
      className="map-click-prevent-overlay"
      onClick={toggleFullscreenMap}
    />);

  let bounds = false;

  if (!center && itinerary && !itinerary.legs[0].transitLeg) {
    bounds = polyline.decode(itinerary.legs[0].legGeometry.points);
  }

  return (
    <Map
      className="full"
      leafletObjs={leafletObjs}
      lat={center ? center.lat : from.lat}
      lon={center ? center.lon : from.lon}
      zoom={bounds ? undefined : 16}
      bounds={bounds}
      fitBounds={bounds !== false}
      disableZoom={false}
      boundsOptions={{ maxZoom: 16 }}
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
  from: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }).isRequired,
  to: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }).isRequired,
  center: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }),
  routes: React.PropTypes.arrayOf(React.PropTypes.shape({
    fullscreenMap: React.PropTypes.bool,
  }).isRequired).isRequired,
};
