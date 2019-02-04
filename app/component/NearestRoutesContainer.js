import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay, { Route } from 'react-relay/classic';
import NearbyDeparturesList from './NearbyDeparturesList';
import NetworkError from './NetworkError';
import Loading from './Loading';

class NearbyDeparturesListRoute extends Route {
  static queries = {
    nearest: (RelayComponent, variables) => Relay.QL`
      query {
        viewer {
          ${RelayComponent.getFragment('nearest', variables)}
        }
      }
    `,
  };

  static paramDefinitions = {
    lat: { required: true },
    lon: { required: true },
    currentTime: { required: true },
    modes: { required: true },
    placeTypes: { required: true },
    maxDistance: { required: true },
    maxResults: { required: true },
    timeRange: { required: true },
  };

  static routeName = 'NearbyDeparturesListRoute';
}

export default class NearestRoutesContainer extends Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    currentTime: PropTypes.number.isRequired,
    modes: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    placeTypes: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    maxDistance: PropTypes.number.isRequired,
    maxResults: PropTypes.number.isRequired,
    timeRange: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    // useSpinner is used to only render the spinner on initial render.
    // After the initial render it is changed to false and data will be updated silently.
    this.useSpinner = true;
  }

  shouldComponentUpdate(nextProps) {
    return (
      nextProps.lat !== this.props.lat ||
      nextProps.lon !== this.props.lon ||
      nextProps.currentTime !== this.props.currentTime ||
      nextProps.modes !== this.props.modes ||
      nextProps.placeTypes !== this.props.placeTypes ||
      nextProps.maxDistance !== this.props.maxDistance ||
      nextProps.maxResults !== this.props.maxResults ||
      nextProps.timeRange !== this.props.timeRange
    );
  }

  render() {
    return (
      <Relay.Renderer
        Container={NearbyDeparturesList}
        queryConfig={
          new NearbyDeparturesListRoute({
            lat: this.props.lat,
            lon: this.props.lon,
            currentTime: this.props.currentTime,
            modes: this.props.modes,
            placeTypes: this.props.placeTypes,
            maxDistance: this.props.maxDistance,
            maxResults: this.props.maxResults,
            timeRange: this.props.timeRange,
          })
        }
        environment={Relay.Store}
        render={({ error, props, retry }) => {
          if (error) {
            this.useSpinner = true;
            return <NetworkError retry={retry} />;
          }
          if (props) {
            this.useSpinner = false;
            return <NearbyDeparturesList {...props} />;
          }
          if (this.useSpinner === true) {
            return <Loading />;
          }
          return undefined;
        }}
      />
    );
  }
}
