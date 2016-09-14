import React from 'react';
import Relay from 'react-relay';
import PlaceAtDistanceListContainer from './PlaceAtDistanceListContainer';
import config from '../../config';

const NearbyRouteList = (props) => (
  <PlaceAtDistanceListContainer
    currentTime={props.currentTime}
    places={props.nearest.places}
  />
);

NearbyRouteList.propTypes = {
  nearest: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
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
          filterByPlaceTypes: $placeTypes
        ) {
          ${PlaceAtDistanceListContainer.getFragment('places', {
            currentTime: variables.currentTime })
          }
        }
      }
    `,
  },

  initialVariables: {
    lat: null,
    lon: null,
    maxDistance: config.nearbyRoutes.radius,
    maxResults: config.nearbyRoutes.results || 50,
    modes: [],
    placeTypes: [],
    currentTime: 0,
  },
});
