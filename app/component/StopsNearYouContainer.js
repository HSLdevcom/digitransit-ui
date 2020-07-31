import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import StopNearYou from './StopNearYou';

class StopsNearYouContainer extends React.Component {
  static propTypes = {
    stopPatterns: PropTypes.any,
    currentTime: PropTypes.number.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    favouriteIds: PropTypes.object.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object,
  };

  componentDidUpdate({ relay, currentTime }) {
    relay.refetch(oldVariables => {
      return { ...oldVariables, startTime: currentTime };
    });
  }

  sortStops = (first, second) => {
    const firstIsFavourite = this.props.favouriteIds.has(
      first.node.place.gtfsId,
    );
    const secondIsFavourite = this.props.favouriteIds.has(
      second.node.place.gtfsId,
    );
    if (firstIsFavourite === secondIsFavourite) {
      return 0;
    }
    if (firstIsFavourite) {
      return -1;
    }
    return 1;
  };

  createNearbyStops = () => {
    const stopPatterns = this.props.stopPatterns.edges;
    const sortedPatterns = stopPatterns.slice().sort(this.sortStops);
    const stops = sortedPatterns.map(({ node }) => {
      const stop = node.place;
      if (stop.stoptimesWithoutPatterns.length > 0) {
        return (
          <StopNearYou
            key={`${stop.gtfsId}`}
            stop={stop}
            distance={node.distance}
            color={this.context.config.colors.primary}
            currentTime={this.props.currentTime}
          />
        );
      }
      return null;
    });
    return stops;
  };

  render() {
    return (
      <div className="stops-near-you-container">{this.createNearbyStops()}</div>
    );
  }
}

const connectedContainer = createRefetchContainer(
  connectToStores(
    StopsNearYouContainer,
    ['TimeStore', 'FavouriteStore'],
    ({ getStore }) => ({
      currentTime: getStore('TimeStore')
        .getCurrentTime()
        .unix(),
      favouriteIds: new Set(
        getStore('FavouriteStore')
          .getStops()
          .map(stop => stop.gtfsId),
      ),
    }),
  ),
  {
    stopPatterns: graphql`
      fragment StopsNearYouContainer_stopPatterns on placeAtDistanceConnection
        @argumentDefinitions(
          startTime: { type: "Long!", defaultValue: 0 }
          omitNonPickups: { type: "Boolean!", defaultValue: false }
        ) {
        edges {
          node {
            distance
            place {
              __typename
              ... on Stop {
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
                  omitNonPickups: $omitNonPickups
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
                      gtfsId
                      mode
                      patterns {
                        headsign
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
  graphql`
    query StopsNearYouContainer_Query(
      $lat: Float!
      $lon: Float!
      $filterByPlaceTypes: [FilterPlaceType]
      $filterByModes: [Mode]
      $maxResults: Int!
      $startTime: Long!
      $omitNonPickups: Boolean!
    ) {
      stopPatterns: nearest(
        lat: $lat
        lon: $lon
        filterByPlaceTypes: $filterByPlaceTypes
        filterByModes: $filterByModes
        maxResults: $maxResults
      ) {
        ...StopsNearYouContainer_stopPatterns
          @arguments(startTime: $startTime, omitNonPickups: $omitNonPickups)
      }
    }
  `,
);

export { connectedContainer as default, StopsNearYouContainer as Component };
