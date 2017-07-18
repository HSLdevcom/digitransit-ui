import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';
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

export default Relay.createContainer(NearbyRouteList, {
  fragments: {
    nearest: variables => Relay.QL`
      fragment on QueryType {
        places: nearest(
          lat: $lat,
          lon: $lon,
          maxDistance: $maxDistance,
          maxResults: $maxResults,
          first: $maxResults,
          filterByModes: $modes,
          filterByPlaceTypes: $placeTypes,
        ) {
          ${PlaceAtDistanceListContainer.getFragment('places', {
            currentTime: variables.currentTime,
            timeRange: variables.timeRange,
          })}
        }
      }
    `,
  },

  initialVariables: {
    lat: null,
    lon: null,
    maxDistance: 0,
    maxResults: 50,
    modes: [],
    placeTypes: [],
    currentTime: 0,
    timeRange: 0,
  },
});
