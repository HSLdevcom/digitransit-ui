import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { intlShape, FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape, routerShape } from 'found';
import { indexOf } from 'lodash-es';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import StopNearYou from './StopNearYou';
import withBreakpoint from '../util/withBreakpoint';
import CityBikeStopNearYou from './CityBikeStopNearYou';

class StopsNearYouContainer extends React.Component {
  static propTypes = {
    stopPatterns: PropTypes.any,
    currentTime: PropTypes.number.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    favouriteIds: PropTypes.object.isRequired,
    favouriteRentalStations: PropTypes.array.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired,
    match: matchShape.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      stopCount: 5,
    };
  }

  componentDidUpdate({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.refetch(oldVariables => {
        return {
          ...oldVariables,
          startTime: currentTime,
          first: this.state.stopCount,
          maxResults: this.state.stopCount,
        };
      });
    }
  }

  isFavouriteRentalStation = station => {
    return (
      this.props.favouriteRentalStations.filter(
        rentalStation =>
          rentalStation.stationId === station.stationId &&
          isEqual(sortBy(rentalStation.networks), sortBy(station.networks)),
      ).length > 0
    );
  };

  sortRentalStations = (first, second) => {
    const firstIsFavourite = this.isFavouriteRentalStation(first.node.place);
    const secondIsFavourite = this.isFavouriteRentalStation(second.node.place);
    if (firstIsFavourite === secondIsFavourite) {
      return 0;
    }
    if (firstIsFavourite) {
      return -1;
    }
    return 1;
  };

  sortStops = (first, second) => {
    const firstStopOrStationId = first.node.place.parentStation
      ? first.node.place.parentStation.gtfsId
      : first.node.place.gtfsId;
    const secondStopOrStationId = second.node.place.parentStation
      ? second.node.place.parentStation.gtfsId
      : second.node.place.gtfsId;
    const firstIsFavourite = this.props.favouriteIds.has(firstStopOrStationId);
    const secondIsFavourite = this.props.favouriteIds.has(
      secondStopOrStationId,
    );
    if (firstIsFavourite === secondIsFavourite) {
      return 0;
    }
    if (firstIsFavourite) {
      return -1;
    }
    return 1;
  };

  showMore = () => {
    this.state.stopCount += 5;
    this.props.relay.refetch(oldVariables => {
      return {
        ...oldVariables,
        startTime: this.props.currentTime,
        first: this.state.stopCount,
        maxResults: this.state.stopCount,
      };
    });
  };

  createNearbyStops = () => {
    const stopPatterns = this.props.stopPatterns.nearest.edges;
    const terminalNames = [];
    const isCityBikeView = this.context.match.params.mode === 'CITYBIKE';
    const sortedPatterns = isCityBikeView
      ? stopPatterns.slice().sort(this.sortRentalStations)
      : stopPatterns.slice().sort(this.sortStops);
    const stops = sortedPatterns.map(({ node }) => {
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
      <>
        <div role="list" className="stops-near-you-container">
          {this.createNearbyStops()}
        </div>
        <button
          aria-label={this.context.intl.formatMessage({
            id: 'show-more-stops-near-you',
            defaultMessage: 'Load more nearby stops',
          })}
          className="show-more-button"
          onClick={this.showMore}
        >
          <FormattedMessage id="show-more" defaultMessage="Show more" />
        </button>
      </>
    );
  }
}
const StopsNearYouContainerWithBreakpoint = withBreakpoint(
  StopsNearYouContainer,
);

const connectedContainer = createRefetchContainer(
  connectToStores(
    StopsNearYouContainerWithBreakpoint,
    ['TimeStore', 'FavouriteStore'],
    ({ getStore }) => ({
      currentTime: getStore('TimeStore').getCurrentTime().unix(),
      favouriteIds: new Set(
        getStore('FavouriteStore')
          .getStopsAndStations()
          .map(stop => stop.gtfsId),
      ),
      favouriteRentalStations: getStore(
        'FavouriteStore',
      ).getBikeRentalStations(),
    }),
  ),
  {
    stopPatterns: graphql`
      fragment StopsNearYouContainer_stopPatterns on QueryType
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        omitNonPickups: { type: "Boolean!", defaultValue: false }
        lat: { type: "Float!" }
        lon: { type: "Float!", defaultValue: 0 }
        filterByPlaceTypes: { type: "[FilterPlaceType]", defaultValue: null }
        filterByModes: { type: "[Mode]", defaultValue: null }
        first: { type: "Int!", defaultValue: 5 }
        maxResults: { type: "Int" }
        maxDistance: { type: "Int" }
      ) {
        nearest(
          lat: $lat
          lon: $lon
          filterByPlaceTypes: $filterByPlaceTypes
          filterByModes: $filterByModes
          first: $first
          maxResults: $maxResults
          maxDistance: $maxDistance
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
      }
    `,
  },
  graphql`
    query StopsNearYouContainerRefetchQuery(
      $lat: Float!
      $lon: Float!
      $filterByPlaceTypes: [FilterPlaceType]
      $filterByModes: [Mode]
      $first: Int!
      $maxResults: Int!
      $maxDistance: Int!
      $startTime: Long!
      $omitNonPickups: Boolean!
    ) {
      viewer {
        ...StopsNearYouContainer_stopPatterns
        @arguments(
          startTime: $startTime
          omitNonPickups: $omitNonPickups
          lat: $lat
          lon: $lon
          filterByPlaceTypes: $filterByPlaceTypes
          filterByModes: $filterByModes
          first: $first
          maxResults: $maxResults
          maxDistance: $maxDistance
        )
      }
    }
  `,
);

export { connectedContainer as default, StopsNearYouContainer as Component };
