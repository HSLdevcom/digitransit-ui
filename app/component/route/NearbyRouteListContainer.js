import React from 'react';
import Relay from 'react-relay';
import PlaceAtDistanceListContainer, {
  placeAtDistanceListContainerFragment,
} from './PlaceAtDistanceListContainer';
import config from '../../config';

const NearbyRouteList = (props) => {
  return (
    <PlaceAtDistanceListContainer
      currentTime={parseInt(props.currentTime, 10)}
      places={props.nearest.places}
    />
  );
};

export default Relay.createContainer(NearbyRouteList, {
  fragments: {
    nearest: variables => Relay.QL`
      fragment on QueryType {
        places: nearest(lat: $lat, lon: $lon,
                  maxDistance: $maxDistance,
                  maxResults: 50,
                  first: 50,
                  filterByModes: $modes,
                  filterByPlaceTypes: $placeTypes) @relay(isConnectionWithoutNodeID: true) {
          ${PlaceAtDistanceListContainer.getFragment('places', { currentTime: variables.currentTime })}
        }
      }
    `,
  },

  prepareVariables: vars => {
    /*
    console.log(vars.modes);
    if (vars.modes) {
      const onlyCityBike = vars.modes.length === 1 && vars.modes.join(",").indexOf("BICYCLE_RENT") != -1;
      if (onlyCityBike) {
        vars.placeTypes = ['BICYCLE_RENT'];
      } else {
        vars.placeTypes = ['DEPARTURE_ROW', 'BICYCLE_RENT'];
        //vars.modes = ['BUS', 'TRAM', 'RAIL', 'SUBWAY', 'FERRY', 'AIRPLANE'];
      }
    }
    */
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
    modes: [],
    placeTypes: [],
    currentTime: 0,
  },
});
