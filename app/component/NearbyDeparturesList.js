import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import sortBy from 'lodash/sortBy';
import { FormattedMessage } from 'react-intl';

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
          distance={o.node.distance}
          departure={o.node.place}
          currentTime={values.currentTime}
          timeRange={values.timeRange}
        />
      );
    } else if (o.node.place.__typename === 'BikeRentalStation') {
      place = (
        <BicycleRentalStationRowContainer
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

const PlaceAtDistanceList = ({
  nearest: { places },
  currentTime,
  timeRange,
}) => {
  if (places && places.edges) {
    return (
      <div className="nearby-table-container">
        <table className="nearby-departures-table">
          <thead>
            <tr className="header-tr">
              <th>
                <FormattedMessage id="to-stop" defaultMessage="To stop" />
              </th>
              <th>
                <FormattedMessage id="route" defaultMessage="Route" />
              </th>
              <th>
                <FormattedMessage
                  id="destination"
                  defaultMessage="Destination"
                />
              </th>
              <th>
                <FormattedMessage id="leaves" defaultMessage="Leaves" />
              </th>
              <th>
                <FormattedMessage id="next" defaultMessage="Next" />
              </th>
            </tr>
          </thead>
          <tbody>
            {constructPlacesList({ places, currentTime, timeRange })}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
};

PlaceAtDistanceList.propTypes = {
  places: PropTypes.object.isRequired,
  nearest: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  timeRange: PropTypes.number.isRequired,
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
