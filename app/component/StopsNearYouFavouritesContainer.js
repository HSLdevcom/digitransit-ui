import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { graphql, createRefetchContainer } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { dtLocationShape } from '../util/shapes';
import StopNearYou from './StopNearYou';
import CityBikeStopNearYou from './CityBikeStopNearYou';

function StopsNearYouFavouritesContainer({
  currentTime,
  stops,
  stations,
  bikeStations,
  searchPosition,
  relay,
}) {
  useEffect(() => {
    relay.refetch(oldVariables => {
      return { ...oldVariables, startTime: currentTime };
    });
  }, [currentTime]);
  const stopList = [];
  stopList.push(
    ...stops
      .filter(s => s)
      .map(stop => {
        return {
          type: 'stop',
          distance: distance(searchPosition, stop),
          ...stop,
        };
      }),
  );
  stopList.push(
    ...stations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'station',
          distance: distance(searchPosition, stop),
          ...stop,
        };
      }),
  );
  stopList.push(
    ...bikeStations
      .filter(s => s)
      .map(stop => {
        return {
          type: 'bikeRentalStation',
          distance: distance(searchPosition, stop),
          ...stop,
        };
      }),
  );
  stopList.sort((a, b) => a.distance - b.distance);
  const stopElements = stopList.map(stop => {
    switch (stop.type) {
      case 'stop':
        return (
          <StopNearYou
            key={stop.gtfsId}
            stop={stop}
            currentTime={currentTime}
          />
        );
      case 'station':
        return (
          <StopNearYou
            key={stop.gtfsId}
            stop={stop}
            desc={stop.stops[0].desc}
            stopIsStation
            currentTime={currentTime}
          />
        );
      case 'bikeRentalStation':
        return <CityBikeStopNearYou key={stop.name} stop={stop} />;
      default:
        return null;
    }
  });
  return <>{stopElements}</>;
}
StopsNearYouFavouritesContainer.propTypes = {
  stops: PropTypes.array,
  stations: PropTypes.array,
  bikeStations: PropTypes.array,
  searchPosition: dtLocationShape,
  relay: PropTypes.shape({
    refetch: PropTypes.func.isRequired,
  }).isRequired,
  currentTime: PropTypes.number.isRequired,
};

const connectedContainer = connectToStores(
  StopsNearYouFavouritesContainer,
  ['TimeStore'],
  ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime().unix(),
  }),
);

const refetchContainer = createRefetchContainer(
  connectedContainer,
  {
    stops: graphql`
      fragment StopsNearYouFavouritesContainer_stops on Stop
      @relay(plural: true)
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
        id
        name
        gtfsId
        code
        desc
        lat
        lon
        zoneId
        platformCode
        vehicleMode
        stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: true) {
          scheduledArrival
          realtimeArrival
          arrivalDelay
          scheduledDeparture
          realtimeDeparture
          departureDelay
          realtime
          realtimeState
          serviceDay
          headsign
          trip {
            route {
              shortName
              longName
              gtfsId
              mode
              color
              patterns {
                headsign
              }
            }
          }
        }
        parentStation {
          id
          name
          gtfsId
          code
          desc
          lat
          lon
          zoneId
          platformCode
          vehicleMode
          stoptimesWithoutPatterns(
            startTime: $startTime
            omitNonPickups: true
          ) {
            scheduledArrival
            realtimeArrival
            arrivalDelay
            scheduledDeparture
            realtimeDeparture
            departureDelay
            realtime
            realtimeState
            serviceDay
            headsign
            trip {
              route {
                shortName
                longName
                gtfsId
                mode
                patterns {
                  headsign
                }
              }
            }
            stop {
              platformCode
            }
          }
        }
      }
    `,
    stations: graphql`
      fragment StopsNearYouFavouritesContainer_stations on Stop
      @relay(plural: true)
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
        id
        name
        gtfsId
        code
        desc
        lat
        lon
        zoneId
        platformCode
        vehicleMode
        stops {
          desc
        }
        stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: true) {
          scheduledArrival
          realtimeArrival
          arrivalDelay
          scheduledDeparture
          realtimeDeparture
          departureDelay
          realtime
          realtimeState
          serviceDay
          headsign
          trip {
            route {
              shortName
              longName
              gtfsId
              mode
              color
              patterns {
                headsign
              }
            }
          }
          stop {
            platformCode
          }
        }
      }
    `,
    bikeStations: graphql`
      fragment StopsNearYouFavouritesContainer_bikeStations on BikeRentalStation
      @relay(plural: true) {
        stationId
        name
        bikesAvailable
        spacesAvailable
        capacity
        networks
        lat
        lon
      }
    `,
  },
  graphql`
    query StopsNearYouFavouritesContainerRefetchQuery(
      $stopIds: [String!]!
      $stationIds: [String!]!
      $bikeRentalStationIds: [String!]!
      $startTime: Long!
    ) {
      stops: stops(ids: $stopIds) {
        ...StopsNearYouFavouritesContainer_stops
        @arguments(startTime: $startTime)
      }
      stations: stations(ids: $stationIds) {
        ...StopsNearYouFavouritesContainer_stations
        @arguments(startTime: $startTime)
      }
      bikeStations: bikeRentalStations(ids: $bikeRentalStationIds) {
        ...StopsNearYouFavouritesContainer_bikeStations
      }
    }
  `,
);

export {
  refetchContainer as default,
  StopsNearYouFavouritesContainer as Component,
};
