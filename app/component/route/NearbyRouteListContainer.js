import React from 'react';
import Relay from 'react-relay';
import PlaceAtDistanceListContainer, {
  placeAtDistanceListContainerFragment,
} from './PlaceAtDistanceListContainer';
import config from '../../config';

const NearbyRouteListContainer = (props) => {
  return (<PlaceAtDistanceListContainer currentTime={parseInt(props.currentTime, 10)} places={props.nearest.places}/>);
};

export default Relay.createContainer(NearbyRouteListContainer, {
  fragments: {
    nearest: variables => Relay.QL`
      fragment on QueryType {
        places: nearest(lat: $lat, lon: $lon,
                  maxDistance: $maxDistance,
                  maxResults: 50,
                  first: 50,
                  filterByPlaceTypes: [DEPARTURE_ROW, BICYCLE_RENT, BIKE_PARK, CAR_PARK]) @relay(isConnectionWithoutNodeID: true) {
          ${PlaceAtDistanceListContainer.getFragment('places',  { currentTime: variables.currentTime })}
        }
      }
    `,
  },

  prepareVariables: vars => {
    if (vars.currentTime) {
      vars.currentTime = parseInt(vars.currentTime, 10);
    }
    console.log(vars);
    return vars;
  },

  initialVariables: {
    lat: null,
    lon: null,
    maxDistance: config.nearbyRoutes.radius,
    //agency: config.preferredAgency,
    currentTime: 0,
  },
});
