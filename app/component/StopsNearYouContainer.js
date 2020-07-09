import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import StopNearYou from './StopNearYou';

class StopsNearYouContainer extends React.Component {
  static propTypes = {
    stopPatterns: PropTypes.any,
    currentTime: PropTypes.number.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object,
  };

  static getDerivedStateFromProps({ relay, currentTime }) {
    relay.refetch(oldVariables => {
      return { ...oldVariables, startTime: currentTime };
    });
  }

  createNearbyStops = () => {
    const stopPatterns = this.props.stopPatterns.edges;
    const stops = stopPatterns.map(({ node }) => {
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
  connectToStores(StopsNearYouContainer, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    stopPatterns: graphql`
      fragment StopsNearYouContainer_stopPatterns on placeAtDistanceConnection
        @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
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
                vehicleMode
                stoptimesWithoutPatterns(startTime: $startTime) {
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
    ) {
      stopPatterns: nearest(
        lat: $lat
        lon: $lon
        filterByPlaceTypes: $filterByPlaceTypes
        filterByModes: $filterByModes
        maxResults: $maxResults
      ) {
        ...StopsNearYouContainer_stopPatterns @arguments(startTime: $startTime)
      }
    }
  `,
);

export { connectedContainer as default, StopsNearYouContainer as Component };
