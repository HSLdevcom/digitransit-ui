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
const PlaceAtDistanceList = (props) => {
  const rows = [];
  if (props.places && props.places.edges) {
    props.places.edges.forEach((edge) => {
      const node = edge.node;
      const hasDepartures = node.place.__typename !== 'DepartureRow' ||
        (node.place.stoptimes && node.place.stoptimes.length > 0);
      if (hasDepartures) {
        rows.push(
          <PlaceAtDistanceContainer
            key={node.place.id}
            currentTime={props.currentTime}
            placeAtDistance={node}
          />,
        );
      }
    });
  }
  return (<div>{rows}</div>);
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
