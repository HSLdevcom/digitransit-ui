import React from 'react';
import Relay from 'react-relay';
import sortBy from 'lodash/sortBy';

import PlaceAtDistanceContainer from './PlaceAtDistanceContainer';
import { round } from './Distance';

export const placeAtDistanceListContainerFragment = variables => Relay.QL`
  fragment on placeAtDistanceConnection {
    edges {
      node {
        distance
        place {
          id
          __typename
          ... on DepartureRow {
            stoptimes (startTime:$currentTime, timeRange: $timeRange, numberOfDepartures:2) {
              pickupType
              serviceDay
              realtimeDeparture
            }
          }
        }
        ${PlaceAtDistanceContainer.getFragment('placeAtDistance', {
          currentTime: variables.currentTime,
          timeRange: variables.timeRange })},
      }
    }
  }
`;

const testStopTimes = stoptimes => (stoptimes && stoptimes.length > 0);

/* eslint-disable no-underscore-dangle */
const PlaceAtDistanceList = ({ places, currentTime, timeRange }) => {
  if (places && places.edges) {
    return (<div>
      {sortBy(places.edges.filter(
          ({ node }) => node.place.__typename !== 'DepartureRow' ||
          testStopTimes(node.place.stoptimes),
        ), [({ node }) => round(node.distance), ({ node }) =>
          (testStopTimes(node.place.stoptimes) &&
            (node.place.stoptimes[0].serviceDay +
            node.place.stoptimes[0].realtimeDeparture))])
      .map(({ node }) =>
        <PlaceAtDistanceContainer
          key={node.place.id}
          currentTime={currentTime}
          timeRange={timeRange}
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
  timeRange: React.PropTypes.number.isRequired,
};

export default Relay.createContainer(PlaceAtDistanceList, {
  fragments: {
    places: placeAtDistanceListContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
    timeRange: 0,
  },
});
