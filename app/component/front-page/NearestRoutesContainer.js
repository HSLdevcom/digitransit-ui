import React, { Component, PropTypes } from 'react';
import Relay, { Route } from 'react-relay';
import NearbyRouteListContainer from '../route/NearbyRouteListContainer';

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
    modes: PropTypes.array.isRequired,
  };

  constructor() {
    super();
    // useSpinner is used to only render the spinner on initial render.
    // After the initial render it is changed to false and data will be updated silently.
    this.useSpinner = true;
  }

  componentDidMount() {
    this.useSpinner = false;
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.lat !== this.props.lat ||
      nextProps.lon !== this.props.lon ||
      nextProps.currentTime !== this.props.currentTime ||
      nextProps.modes !== this.props.modes
    );
  }

  render() {
    return (
      <Relay.RootContainer
        Component={NearbyRouteListContainer}
        route={new NearbyRouteListContainerRoute({
          lat: this.props.lat,
          lon: this.props.lon,
          currentTime: this.props.currentTime.toString(),
        })}
        renderLoading={() => {
          if (this.useSpinner === true) {
            return <div className="spinner-loader" />;
          }
          return undefined;
        }}
        renderFetched={data =>
          <NearbyRouteListContainer {...data} modes={this.props.modes} />
        }
      />
    );
  }
}
