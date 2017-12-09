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

const constructPlacesList = values => {
  const sortedList = sortBy(
    values.places.edges.filter(
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
  ).map(o => {
    let place;
    if (o.node.place.__typename === 'DepartureRow') {
      place = (
        <DepartureRowContainer
          key={o.node.place.id}
          distance={o.node.distance}
          departure={o.node.place}
          currentTime={values.currentTime}
          timeRange={values.timeRange}
        />
      );
    } else if (o.node.place.__typename === 'BikeRentalStation') {
      place = (
        <BicycleRentalStationRowContainer
          key={o.node.place.id}
          distance={o.node.distance}
          station={o.node.place}
          currentTime={values.currentTime}
        />
      );
    }
    return place;
  });
  return sortedList;
};

/* eslint-enable no-underscore-dangle */

const PlaceAtDistanceList = ({
  nearest: { places },
  currentTime,
  timeRange,
}) => {
  if (places && places.edges) {
    return (
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
        content={constructPlacesList({ places, currentTime, timeRange })}
      />
    );
  }
  return null;
};

PlaceAtDistanceList.propTypes = {
  nearest: PropTypes.shape({
    places: PropTypes.shape({
      edges: PropTypes.array.isRequired,
    }).isRequired,
  }).isRequired,
  currentTime: PropTypes.number.isRequired,
  timeRange: PropTypes.number.isRequired,
};

export default createFragmentContainer(PlaceAtDistanceList, {
  nearest: graphql`
    fragment NearbyDeparturesList_nearest on QueryType {
      places: nearest(
        lat: $lat
        lon: $lon
        maxDistance: $maxDistance
        maxResults: $maxResults
        first: $maxResults
        filterByModes: $modes
        filterByPlaceTypes: $placeTypes
      ) {
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
              ...DepartureRowContainer_departure
              ...BicycleRentalStationRowContainer_station
            }
            distance
          }
        }
      }
    }
  `,
});
