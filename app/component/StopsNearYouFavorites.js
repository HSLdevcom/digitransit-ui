import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { dtLocationShape } from '../util/shapes';
import StopNearYou from './StopNearYou';
import CityBikeStopNearYou from './CityBikeStopNearYou';
import withBreakpoint from '../util/withBreakpoint';

function StopsNearYouFavorites({
  favoriteStops,
  favoriteStations,
  favoriteBikeRentalStationIds,
  relayEnvironment,
  currentTime,
  searchPosition,
}) {
  return (
    <QueryRenderer
      query={graphql`
        query StopsNearYouFavoritesQuery(
          $stopIds: [String!]!
          $stationIds: [String!]!
          $bikeRentalStationIds: [String!]!
        ) {
          stops: stops(ids: $stopIds) {
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
            stoptimesWithoutPatterns(startTime: 0, omitNonPickups: true) {
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
              stoptimesWithoutPatterns(startTime: 0, omitNonPickups: true) {
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
          stations: stations(ids: $stationIds) {
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
            stoptimesWithoutPatterns(startTime: 0, omitNonPickups: true) {
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
          bikeRentalStations: bikeRentalStations(ids: $bikeRentalStationIds) {
            stationId
            name
            bikesAvailable
            spacesAvailable
            networks
            lat
            lon
          }
        }
      `}
      variables={{
        stopIds: favoriteStops,
        stationIds: favoriteStations,
        bikeRentalStationIds: favoriteBikeRentalStationIds,
      }}
      environment={relayEnvironment}
      render={({ props }) => {
        if (props) {
          const stopList = [];
          stopList.push(
            ...props.stops.map(stop => {
              return {
                type: 'stop',
                distance: distance(searchPosition, stop),
                ...stop,
              };
            }),
          );
          stopList.push(
            ...props.stations.map(stop => {
              return {
                type: 'station',
                distance: distance(searchPosition, stop),
                ...stop,
              };
            }),
          );
          stopList.push(
            ...props.bikeRentalStations.map(stop => {
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
                return <StopNearYou stop={stop} currentTime={currentTime} />;
              case 'station':
                return (
                  <StopNearYou
                    stop={stop}
                    stopIsStation
                    currentTime={currentTime}
                  />
                );
              case 'bikeRentalStation':
                return <CityBikeStopNearYou stop={stop} />;
              default:
                return null;
            }
          });
          return <div className="stops-near-you-page">{stopElements}</div>;
        }
        return undefined;
      }}
    />
  );
}
StopsNearYouFavorites.propTypes = {
  favoriteStops: PropTypes.array,
  favoriteStations: PropTypes.array,
  favoriteBikeRentalStationIds: PropTypes.array,
  relayEnvironment: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  searchPosition: dtLocationShape.isRequired,
  stops: PropTypes.array,
  stations: PropTypes.array,
  bikeRentalStations: PropTypes.array,
};

const StopsNearYouFavoritesWithBreakpoint = withBreakpoint(
  StopsNearYouFavorites,
);

const connectedContainer = connectToStores(
  StopsNearYouFavoritesWithBreakpoint,
  ['TimeStore'],
  ({ getStore }) => {
    return {
      currentTime: getStore('TimeStore').getCurrentTime().unix(),
    };
  },
);

export default connectedContainer;
