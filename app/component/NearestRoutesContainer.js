import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { QueryRenderer } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { graphql } from 'relay-runtime';
import StaticContainer from 'react-static-container';
import NearbyDeparturesList from './NearbyDeparturesList';
import NetworkError from './NetworkError';
import Loading from './Loading';

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
      <QueryRenderer
        environment={Store}
        query={graphql`
          query NearestRoutesContainerQuery(
            $lat: Float!
            $lon: Float!
            $maxDistance: Int
            $maxResults: Int
            $modes: [Mode!]
            $placeTypes: [FilterPlaceType!]
          ) {
            viewer {
              places: nearest(
                lat: $lat
                lon: $lon
                maxDistance: $maxDistance
                maxResults: $maxResults
                first: $maxResults
                filterByModes: $modes
                filterByPlaceTypes: $placeTypes
              ) {
                edges {
                  ...NearbyDeparturesList_edges
                }
              }
            }
          }
        `}
        variables={this.props}
        render={({ error, props, retry }) => {
          const shouldUpdate =
            props &&
            props.viewer &&
            props.viewer.places &&
            props.viewer.places.edges;
          if (error) {
            this.useSpinner = false;
            return <NetworkError retry={retry} />;
          } else if (shouldUpdate || !this.useSpinner) {
            this.useSpinner = false;
            return (
              <StaticContainer shouldUpdate={shouldUpdate}>
                {shouldUpdate && (
                  <NearbyDeparturesList
                    currentTime={this.props.currentTime}
                    edges={props.viewer.places.edges}
                  />
                )}
              </StaticContainer>
            );
          }
          return <Loading />;
        }}
      />
    );
  }
}
