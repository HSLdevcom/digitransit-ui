import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import some from 'lodash/some';
import Icon from './Icon';
import Map from './map/Map';
import RouteLine from './map/route/RouteLine';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import StopCardHeaderContainer from './StopCardHeaderContainer';
import { getStartTime } from '../util/timeUtils';

function RouteMapContainer(
  { pattern, trip, vehicles, routes },
  { router, location, breakpoint },
) {
  if (!pattern) {
    return false;
  }

  let selectedVehicle;
  let fitBounds = true;
  let zoom;
  let tripStart;

  if (trip) {
    tripStart = getStartTime(trip.stoptimesForDate[0].scheduledDeparture);
    const vehiclesWithCorrectStartTime = Object.keys(vehicles)
      .map(key => vehicles[key])
      .filter(vehicle => vehicle.tripStartTime === tripStart);

    selectedVehicle =
      vehiclesWithCorrectStartTime &&
      vehiclesWithCorrectStartTime.length > 0 &&
      vehiclesWithCorrectStartTime[0];

    if (selectedVehicle) {
      fitBounds = false;
      zoom = 15;
    }
  }

  const fullscreen = some(routes, route => route.fullscreenMap);

  const toggleFullscreenMap = () => {
    if (fullscreen) {
      router.goBack();
      return;
    }
    router.push(`${location.pathname}/kartta`);
  };

  const leafletObjs = [
    <RouteLine key="line" pattern={pattern} />,
    <VehicleMarkerContainer
      key="vehicles"
      direction={pattern.directionId}
      pattern={pattern.code}
      tripStart={tripStart}
      useSmallIcons={false}
    />,
  ];

  const showScale = fullscreen || breakpoint === 'large';

  let filteredPoints;
  if (pattern.geometry) {
    filteredPoints = pattern.geometry.filter(
      point => point.lat !== null && point.lon !== null,
    );
  }
  return (
    <Map
      lat={(selectedVehicle && selectedVehicle.lat) || undefined}
      lon={(selectedVehicle && selectedVehicle.long) || undefined}
      className={'full'}
      leafletObjs={leafletObjs}
      fitBounds={fitBounds}
      bounds={(filteredPoints || pattern.stops).map(p => [p.lat, p.lon])}
      zoom={zoom}
      showScaleBar={showScale}
    >
      {breakpoint !== 'large' &&
        !fullscreen && (
          <div
            className="map-click-prevent-overlay"
            onClick={toggleFullscreenMap}
            key="overlay"
          />
        )}
      {breakpoint !== 'large' && (
        <div className="fullscreen-toggle" onClick={toggleFullscreenMap}>
          {fullscreen ? (
            <Icon img="icon-icon_minimize" className="cursor-pointer" />
          ) : (
            <Icon img="icon-icon_maximize" className="cursor-pointer" />
          )}
        </div>
      )}
    </Map>
  );
}

RouteMapContainer.contextTypes = {
  router: routerShape.isRequired,
  location: PropTypes.object.isRequired,
  breakpoint: PropTypes.string.isRequired,
};

RouteMapContainer.propTypes = {
  trip: PropTypes.shape({
    stoptimesForDate: PropTypes.arrayOf(
      PropTypes.shape({
        scheduledDeparture: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }),
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      fullscreenMap: PropTypes.bool,
    }),
  ).isRequired,
  pattern: PropTypes.object.isRequired,
  vehicles: PropTypes.object,
};

export const RouteMapFragments = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      code
      directionId
      geometry {
        lat
        lon
      }
      stops {
        lat
        lon
        name
        gtfsId
        ${StopCardHeaderContainer.getFragment('stop')}
      }
      ${RouteLine.getFragment('pattern')}
    }
  `,
  trip: () => Relay.QL`
    fragment on Trip {
      stoptimesForDate {
        scheduledDeparture
      }
    }
  `,
};

const RouteMapContainerWithVehicles = connectToStores(
  RouteMapContainer,
  ['RealTimeInformationStore'],
  ({ getStore }) => ({
    vehicles: getStore('RealTimeInformationStore').vehicles,
  }),
);

export default Relay.createContainer(RouteMapContainerWithVehicles, {
  fragments: RouteMapFragments,
});
