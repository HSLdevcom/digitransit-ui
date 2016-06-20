import React from 'react';
import Relay from 'react-relay';
import Link from 'react-router/lib/Link';

import Icon from '../icon/icon';
import Map from '../map/Map';
import RouteLine from '../map/route/route-line';
import VehicleMarkerContainer from '../map/vehicle-marker-container';
import StopCardHeader from '../stop-cards/stop-card-header';


class RouteMapContainer extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  static propTypes = {
    className: React.PropTypes.string.isRequired,
    fullscreen: React.PropTypes.bool,
    trip: React.PropTypes.object,
    tripId: React.PropTypes.string,
    pattern: React.PropTypes.object.isRequired,
  };

  static defaultProps() {
    return {
      fullscreen: false,
    };
  }

  // map can be toggeled fullscreen on Trip page
  getFullScreenToggle() {
    if (this.props.tripId) {
      if (this.props.fullscreen) {
        return (
          <Link to={`/lahdot/${this.props.tripId}`}>
            <div className="fullscreen-toggle">
              <Icon img="icon-icon_maximize" className="cursor-pointer" />
            </div>
          </Link>);
      }
      return (
        <div>
          <div className="map-click-prevent-overlay" onClick={this.toggleFullscreenMap} />
          <Link to={`/lahdot/${this.props.tripId}/kartta`}>
            <div className="fullscreen-toggle">
              <Icon img="icon-icon_maximize" className="cursor-pointer" />
            </div>
          </Link>
        </div>);
    }
    return null;
  }

  toggleFullscreenMap = () => (
    this.context.router.push(`/lahdot/${this.props.tripId}/kartta`)
  );

  render() {
    const leafletObjs = [
      <RouteLine key="line" pattern={this.props.pattern} />,
      <VehicleMarkerContainer
        key="vehicles"
        pattern={this.props.pattern.code}
        trip={this.props.trip}
      />];

    return (
      <Map
        className={this.props.className}
        leafletObjs={leafletObjs}
        fitBounds
        bounds={this.props.pattern.geometry.map((p) => [p.lat, p.lon])}
      >
        {this.getFullScreenToggle()}
      </Map>);
  }
}

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
