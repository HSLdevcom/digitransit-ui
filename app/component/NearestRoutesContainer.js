import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import PlaceAtDistanceListContainer from './PlaceAtDistanceListContainer';
import NetworkError from './NetworkError';
import Loading from './Loading';

export default class NearestRoutesContainer extends Component {
  static propTypes = {
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    currentTime: PropTypes.number.isRequired,
    modes: PropTypes.array.isRequired,
    placeTypes: PropTypes.array.isRequired,
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
        query={graphql.experimental`
          query NearestRoutesContainerQuery(
            $lat: Float!
            $lon: Float!
            $maxDistance: Int!
            $maxResults: Int!
            $modes: [Mode!]
            $placeTypes: [FilterPlaceType]
            $currentTime: Long!
            $timeRange: Int!
          ) {
            places: nearest(
              lat: $lat
              lon: $lon
              maxDistance: $maxDistance
              maxResults: $maxResults
              first: $maxResults
              filterByModes: $modes
              filterByPlaceTypes: $placeTypes
            ) {
              ...PlaceAtDistanceListContainer_places
                @arguments(currentTime: $currentTime, timeRange: $timeRange)
            }
          }
        `}
        variables={{
          lat: this.props.lat,
          lon: this.props.lon,
          maxDistance: this.props.maxDistance,
          maxResults: this.props.maxResults,
          modes: this.props.modes,
          placeTypes: this.props.placeTypes,
          currentTime: this.props.currentTime,
          timeRange: this.props.timeRange,
        }}
        environment={Store}
        render={({ error, props, retry }) => {
          if (error) {
            this.useSpinner = true;
            return <NetworkError retry={retry} />;
          } else if (props) {
            this.useSpinner = false;
            return (
              <PlaceAtDistanceListContainer
                currentTime={this.props.currentTime}
                places={props.places}
              />
            );
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
