import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StopNearYou from './StopNearYou';

class StopsNearYouContainer extends React.Component {
  static propTypes = {
    // stopList: PropTypes.array.isRequired,
    stopPatterns: PropTypes.any,
  };

  static contextTypes = {
    config: PropTypes.object,
  };

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

const connectedContainer = createFragmentContainer(StopsNearYouContainer, {
  stopPatterns: graphql`
    fragment StopsNearYouContainer_stopPatterns on placeAtDistanceConnection {
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
              stoptimesWithoutPatterns {
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
});

export { connectedContainer as default, StopsNearYouContainer as Component };
