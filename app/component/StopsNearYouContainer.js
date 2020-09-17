import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape, routerShape } from 'found';
import { indexOf } from 'lodash-es';
import StopNearYou from './StopNearYou';
import withBreakpoint from '../util/withBreakpoint';
import { getNearYouPath } from '../util/path';
import { addressToItinerarySearch } from '../util/otpStrings';
import { startLocationWatch } from '../action/PositionActions';
import CityBikeStopNearYou from './CityBikeStopNearYou';

class StopsNearYouContainer extends React.Component {
  static propTypes = {
    stopPatterns: PropTypes.any,
    currentTime: PropTypes.number.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
  };

  static contextTypes = {
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
  };

  componentDidUpdate({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.refetch(oldVariables => {
        return { ...oldVariables, startTime: currentTime };
      });
    }
  }

  createNearbyStops = () => {
    const stopPatterns = this.props.stopPatterns.edges;
    const terminalNames = [];
    const stops = stopPatterns.map(({ node }) => {
      const stop = node.place;
      /* eslint-disable-next-line no-underscore-dangle */
      switch (stop.__typename) {
        case 'Stop':
          if (stop.stoptimesWithoutPatterns.length > 0) {
            if (stop.parentStation) {
              if (indexOf(terminalNames, stop.parentStation.name) === -1) {
                terminalNames.push(stop.parentStation.name);
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
            } else {
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
          }
          break;
        case 'BikeRentalStation':
          return (
            <CityBikeStopNearYou
              key={stop.name}
              stop={stop}
              color={this.context.config.colors.primary}
              currentTime={this.props.currentTime}
            />
          );
        default:
          return null;
      }
      return null;
    });
    return stops;
  };

  render() {
    return (
      <div role="list" className="stops-near-you-container">
        {this.createNearbyStops()}
      </div>
    );
  }
}
const StopsNearYouContainerWithBreakpoint = withBreakpoint(
  StopsNearYouContainer,
);

const PositioningWrapper = connectToStores(
  StopsNearYouContainerWithBreakpoint,
  ['PositionStore'],
  (context, props) => {
    const { place, mode } = props.match.params;
    const locationState = context.getStore('PositionStore').getLocationState();

    if (
      place !== 'POS' &&
      (locationState.hasLocation ||
        locationState.isLocationingInProgress ||
        locationState.isReverseGeocodingInProgress)
    ) {
      return { ...props };
    }
    if (locationState.locationingFailed) {
      // props.router.replace(getNearYouPath(context.config.defaultEndPoint))
      return { ...props };
    }

    if (
      locationState.isLocationingInProgress ||
      locationState.isReverseGeocodingInProgress
    ) {
      return { ...props };
    }

    if (locationState.hasLocation) {
      const locationForUrl = addressToItinerarySearch(locationState);
      const newPlace = locationForUrl;
      props.router.replace(getNearYouPath(newPlace, mode));
      return { ...props };
    }
    context.executeAction(startLocationWatch);
    return { ...props };
  },
);
PositioningWrapper.contextTypes = {
  ...PositioningWrapper.contextTypes,
  executeAction: PropTypes.func.isRequired,
};

const connectedContainer = createRefetchContainer(
  connectToStores(PositioningWrapper, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime().unix(),
  })),
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
              ... on BikeRentalStation {
                stationId
                name
                bikesAvailable
                spacesAvailable
                networks
              }
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
