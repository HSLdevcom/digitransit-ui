import React from 'react';
import Relay from 'react-relay';

import PlaceAtDistanceContainer from './PlaceAtDistanceContainer';
import config from '../config';

export const placeAtDistanceListContainerFragment = variables => Relay.QL`
  fragment on placeAtDistanceConnection {
    edges {
      node {
        place {
          id
          __typename
          ... on DepartureRow {
            stoptimes (startTime:$currentTime, timeRange:$timeRange, numberOfDepartures:2) {
              realtimeState
            }
          }
        }
        ${PlaceAtDistanceContainer.getFragment('placeAtDistance', {
          currentTime: variables.currentTime })},
      }
    }
  }
`;

/* eslint-disable no-underscore-dangle */
const PlaceAtDistanceList = ({ places, currentTime }) => {
  if (places && places.edges) {
    return (<div>
      {places.edges.filter(({ node }) => node.place.__typename !== 'DepartureRow' ||
      (node.place.stoptimes && node.place.stoptimes.length > 0))
      .map(({ node }) =>
        <PlaceAtDistanceContainer
          key={node.place.id}
          currentTime={currentTime}
          placeAtDistance={node}
        />,
      )}
    </div>);
  }
  return null;
};
/* eslint-enable no-underscore-dangle */

PlaceAtDistanceList.propTypes = {
  places: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
};

export default Relay.createContainer(PlaceAtDistanceList, {
  fragments: {
    places: placeAtDistanceListContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
    timeRange: config.nearbyRoutes.timeRange || 7200,
  },
});
