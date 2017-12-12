import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import sortBy from 'lodash/sortBy';

import DeparturesTable from './DeparturesTable';
import DepartureRowContainer from './DepartureRowContainer';
import BicycleRentalStationRowContainer from './BicycleRentalStationRowContainer';
import { round } from './Distance';

const testStopTimes = stoptimes => stoptimes && stoptimes.length > 0;

/* eslint-disable no-underscore-dangle */

const constructPlacesList = ({ edges, currentTime }) =>
  sortBy(
    edges.filter(
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
  ).map(({ node }) => {
    if (node.place.__typename === 'DepartureRow') {
      return (
        <DepartureRowContainer
          key={node.place.id}
          distance={node.distance}
          departure={node.place}
          currentTime={currentTime}
        />
      );
    } else if (node.place.__typename === 'BikeRentalStation') {
      return (
        <BicycleRentalStationRowContainer
          key={node.place.id}
          distance={node.distance}
          station={node.place}
          currentTime={currentTime}
        />
      );
    }
    return null;
  });

/* eslint-enable no-underscore-dangle */

const PlaceAtDistanceList = ({ edges, currentTime }) => (
  <DeparturesTable
    headers={[
      {
        id: 'to-stop',
        defaultMessage: 'To Stop',
      },
      {
        id: 'route',
        defaultMessage: 'Route',
      },
      {
        id: 'destination',
        defaultMessage: 'Destination',
      },
      {
        id: 'leaves',
        defaultMessage: 'Leaves',
      },
      {
        id: 'next',
        defaultMessage: 'Next',
      },
    ]}
    content={constructPlacesList({ edges, currentTime })}
  />
);

PlaceAtDistanceList.propTypes = {
  edges: PropTypes.array.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default createFragmentContainer(PlaceAtDistanceList, {
  edges: graphql`
    fragment NearbyDeparturesList_edges on placeAtDistanceEdge
      @relay(plural: true) {
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
          ...DepartureRowContainer_departure
          ...BicycleRentalStationRowContainer_station
        }
      }
    }
  `,
});
