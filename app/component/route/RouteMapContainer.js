import React from 'react';
import Relay from 'react-relay';
import Icon from '../icon/icon';
import Map from '../map/Map';
import RouteLine from '../map/route/RouteLine';
import VehicleMarkerContainer from '../map/VehicleMarkerContainer';
import StopCardHeader from '../stop-cards/StopCardHeader';

function RouteMapContainer(props) {
  const leafletObjs = [
    <RouteLine key="line" pattern={props.pattern} />,
    <VehicleMarkerContainer
      key="vehicles"
      pattern={props.pattern.code}
      trip={props.trip}
    />,
  ];

  return (
    <Map
      className={props.className}
      leafletObjs={leafletObjs}
      fitBounds
      bounds={(props.pattern.geometry || props.pattern.stops).map((p) => [p.lat, p.lon])}
    >
      {props.children}
      <div className="fullscreen-toggle" onClick={props.toggleFullscreenMap} >
        {props.className === 'fullscreen' ?
          <Icon img="icon-icon_minimize" className="cursor-pointer" /> :
          <Icon img="icon-icon_maximize" className="cursor-pointer" />}
      </div>
    </Map>);
}

RouteMapContainer.contextTypes = {
  router: React.PropTypes.object.isRequired,
  location: React.PropTypes.object.isRequired,
};

RouteMapContainer.propTypes = {
  className: React.PropTypes.string,
  trip: React.PropTypes.string,
  tripId: React.PropTypes.string,
  toggleFullscreenMap: React.PropTypes.func.isRequired,
  pattern: React.PropTypes.object.isRequired,
  children: React.PropTypes.node,
};

export const RouteMapFragments = {
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

export default Relay.createContainer(RouteMapContainer, {
  fragments: RouteMapFragments,
});
