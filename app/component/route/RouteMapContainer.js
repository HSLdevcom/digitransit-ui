import React, { PropTypes } from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from '../icon/icon';
import Map from '../map/Map';
import RouteLine from '../map/route/RouteLine';
import VehicleMarkerContainer from '../map/VehicleMarkerContainer';
import StopCardHeader from '../stop-cards/StopCardHeader';


function RouteMapContainer({ pattern, tripStart, className, children, toggleFullscreenMap, vehicles, useSmallIcons = false }) {
  const leafletObjs = [
    <RouteLine key="line" pattern={pattern} />,
    <VehicleMarkerContainer
      key="vehicles"
      pattern={pattern.code}
      tripStart={tripStart}
      useSmallIcons={useSmallIcons}
    />,
  ];

  let selectedVehicle;
  let fitBounds = true;
  let zoom;

  if (tripStart) {
    const vehiclesWithCorrectStartTime = Object.keys(vehicles).map((key) => (vehicles[key]))
      .filter((vehicle) => (vehicle.tripStartTime === tripStart));

    selectedVehicle = (vehiclesWithCorrectStartTime && vehiclesWithCorrectStartTime.length > 0)
      && vehiclesWithCorrectStartTime[0];

    if (selectedVehicle) {
      fitBounds = false;
      zoom = 15;
    }
  }

  return (
    <Map
      lat={(selectedVehicle && selectedVehicle.lat) || undefined}
      lon={(selectedVehicle && selectedVehicle.long) || undefined}
      className={className}
      leafletObjs={leafletObjs}
      fitBounds={fitBounds}
      bounds={pattern.geometry.map((p) => [p.lat, p.lon])}
      zoom={zoom}
    >
      {children}
      <div className="fullscreen-toggle" onClick={toggleFullscreenMap} >
        {className === 'fullscreen' ?
          <Icon img="icon-icon_minimize" className="cursor-pointer" /> :
          <Icon img="icon-icon_maximize" className="cursor-pointer" />}
      </div>
    </Map>);
}

RouteMapContainer.contextTypes = {
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

RouteMapContainer.propTypes = {
  className: PropTypes.string,
  tripStart: PropTypes.string,
  toggleFullscreenMap: PropTypes.func.isRequired,
  pattern: PropTypes.object.isRequired,
  children: PropTypes.node,
  lat: PropTypes.number,
  lon: PropTypes.number,
  vehicles: PropTypes.object,
  useSmallIcons: PropTypes.bool,
};

const RouteMapFragments = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      code
      geometry {
        lat
        lon
      }
      stops {
        lat
        lon
        name
        gtfsId
        ${StopCardHeader.getFragment('stop')}
      }
      ${RouteLine.getFragment('pattern')}
    }
  `,
};

const RouteMapContainerWithVehicles = connectToStores(
  RouteMapContainer,
  ['RealTimeInformationStore'],
  ({ getStore }) => ({
    vehicles: getStore('RealTimeInformationStore').vehicles,
  })
);

export default Relay.createContainer(RouteMapContainerWithVehicles, {
  fragments: RouteMapFragments,
});
