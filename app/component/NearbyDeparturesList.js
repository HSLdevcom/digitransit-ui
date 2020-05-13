import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import sortBy from 'lodash/sortBy';

import DeparturesTable from './DeparturesTable';
import DepartureRowContainer from './DepartureRowContainer';
import BicycleRentalStationRowContainer from './BicycleRentalStationRowContainer';
import { round } from './Distance';

/* eslint-enable no-underscore-dangle */

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
          displayNextDeparture={values.displayNextDeparture}
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

const PlaceAtDistanceList = (
  { nearest: { places }, currentTime, timeRange },
  context,
) => {
  const { displayNextDeparture } = context.config;
  const headers = [
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
  ];
  if (displayNextDeparture) {
    headers.push({
      id: 'next',
      defaultMessage: 'Next',
    });
  }

  if (places && places.edges) {
    return (
      <DeparturesTable
        headers={headers}
        content={constructPlacesList({
          places,
          currentTime,
          timeRange,
          displayNextDeparture,
        })}
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

PlaceAtDistanceList.contextTypes = {
  config: PropTypes.object,
};

export default Relay.createContainer(PlaceAtDistanceList, {
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
                ${DepartureRowContainer.getFragment('departure', {
                  currentTime: variables.currentTime,
                  timeRange: variables.timeRange,
                })}
                ${BicycleRentalStationRowContainer.getFragment('station', {
                  currentTime: variables.currentTime,
                })}
              }
              distance
            }
          }
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
