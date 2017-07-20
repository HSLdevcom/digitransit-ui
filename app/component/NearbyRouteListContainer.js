import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import PlaceAtDistanceListContainer from './PlaceAtDistanceListContainer';

const NearbyRouteList = props =>
  <PlaceAtDistanceListContainer
    currentTime={props.currentTime}
    timeRange={props.timeRange}
    places={props.nearest.places}
  />;

NearbyRouteList.propTypes = {
  nearest: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  timeRange: PropTypes.number.isRequired,
};

export default createFragmentContainer(NearbyRouteList, {
  nearest: graphql`
    fragment NearbyRouteListContainer_nearest on QueryType {
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
      }
    }
  `,
});
