import React, { Component, PropTypes } from 'react';
import Relay, { Route } from 'react-relay';
import NearbyRouteListContainer from '../route/nearby-route-list-container';

class NearbyRouteListContainerRoute extends Route {
  static queries = {
    stops: (RelayComponent, variables) => Relay.QL`
      query {
        viewer {
          ${RelayComponent.getFragment('stops', variables)}
        }
      }
    `,
  };
  static paramDefinitions = {
    lat: { required: true },
    lon: { required: true },
    currentTime: { required: true },
  };
  static routeName = 'NearbyRouteListContainerRoute';
}

export default class NearestRoutesContainer extends Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    currentTime: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.useSpinner = true;
  }

  componentDidMount() {
    this.useSpinner = false;
  }

  shouldComponentUpdate(nextProps) {
    return !(
      nextProps.lat === this.props.lat &&
      nextProps.lon === this.props.lon &&
      nextProps.currentTime === this.props.currentTime
    );
  }

  render() {
    return (
      <Relay.RootContainer
        Component={NearbyRouteListContainer}
        route={new NearbyRouteListContainerRoute({
          lat: this.props.lat,
          lon: this.props.lon,
          currentTime: this.props.currentTime,
        })}
        renderLoading={() => {
          if (this.useSpinner === true) {
            return <div className="spinner-loader" />;
          }
          return undefined;
        }}
      />
    );
  }
}
