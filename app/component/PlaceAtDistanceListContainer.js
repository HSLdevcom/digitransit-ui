import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import sortBy from 'lodash/sortBy';

import PlaceAtDistanceContainer from './PlaceAtDistanceContainer';
import { round } from './Distance';

const testStopTimes = stoptimes => stoptimes && stoptimes.length > 0;

/* eslint-disable no-underscore-dangle */
const PlaceAtDistanceList = ({ places, currentTime, timeRange }) => {
  if (places && places.edges) {
    return (
      <div>
        {sortBy(
          places.edges.filter(
            ({ node }) =>
              node.place.__typename !== 'DepartureRow' ||
              testStopTimes(node.place.stoptimes),
          ),
          [
            ({ node }) => round(node.distance),
            ({ node }) =>
              testStopTimes(node.place.stoptimes) &&
              node.place.stoptimes[0].serviceDay +
                node.place.stoptimes[0].realtimeDeparture,
          ],
        ).map(({ node }) =>
          <PlaceAtDistanceContainer
            key={node.place.id}
            currentTime={currentTime}
            timeRange={timeRange}
            placeAtDistance={node}
          />,
        )}
      </div>
    );
  }
  return null;
};
/* eslint-enable no-underscore-dangle */

PlaceAtDistanceList.propTypes = {
  places: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  timeRange: PropTypes.number.isRequired,
};

export default createFragmentContainer(PlaceAtDistanceList, {
  places: graphql`
    fragment PlaceAtDistanceListContainer_places on placeAtDistanceConnection {
      edges {
        node {
          distance
          place {
            id
            __typename
            ... on DepartureRow {
              stoptimes(
                startTime: $currentTime
                timeRange: $timeRange
                numberOfDepartures: 2
              ) {
                pickupType
                serviceDay
                realtimeDeparture
              }
            }
          }
          ...PlaceAtDistanceContainer_placeAtDistance
        }
      }
    }
  `,
});
