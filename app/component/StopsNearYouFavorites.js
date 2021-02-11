import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import StopNearYou from './StopNearYou';
import CityBikeStopNearYou from './CityBikeStopNearYou';
import withBreakpoint from '../util/withBreakpoint';
import StopsNearYouContainer from './StopsNearYouContainer';

function StopsNearYouFavorites({
  favoriteStops,
  favoriteStations,
  favoriteBikeRentalStationIds,
  relayEnvironment,
  currentTime,
  match,
  searchPosition,
}) {
  // getStopAndStationsQuery(Array.from(favorites)).then(res => console.log(res));
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
          const favouriteStops = props.stops.map(stop => {
            // console.log(stop)
            return <StopNearYou stop={stop} currentTime={currentTime} />;
          });
          const favouriteStations = props.stations.map(stop => {
            console.log(stop);
            return (
              <StopNearYou
                stop={stop}
                stopIsStation
                currentTime={currentTime}
              />
            );
          });
          const favouritebikeStations = props.bikeRentalStations.map(stop => {
            console.log(stop);
            return <CityBikeStopNearYou stop={stop} />;
          });
          return (
            <div className="stops-near-you-page">
              {favouriteStops}
              {favouriteStations}
              {favouritebikeStations}
            </div>
          );
        }
        return undefined;
      }}
    />
  );
}

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
