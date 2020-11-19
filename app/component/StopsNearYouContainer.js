import PropTypes from 'prop-types';
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
import { intlShape, FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape } from 'found';
import { indexOf } from 'lodash-es';
import StopNearYou from './StopNearYou';
import withBreakpoint from '../util/withBreakpoint';
import { sortNearbyRentalStations, sortNearbyStops } from '../util/sortUtils';
import CityBikeStopNearYou from './CityBikeStopNearYou';

class StopsNearYouContainer extends React.Component {
  static propTypes = {
    stopPatterns: PropTypes.any,
    currentTime: PropTypes.number.isRequired,
    relay: PropTypes.shape({
      refetchConnection: PropTypes.func.isRequired,
      hasMore: PropTypes.func.isRequired,
      isLoading: PropTypes.func.isRequired,
      loadMore: PropTypes.func.isRequired,
    }).isRequired,
    favouriteIds: PropTypes.object.isRequired,
    match: matchShape.isRequired,
    position: PropTypes.shape({
      address: PropTypes.string,
      lat: PropTypes.number,
      lon: PropTypes.number,
    }).isRequired,
  };

  static contextTypes = {
    config: PropTypes.object,
    intl: intlShape.isRequired,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      stopCount: 5,
      currentPosition: props.position,
      fetchMoreStops: false,
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    let newState = null;
    if (
      !prevState.currentPosition ||
      (!prevState.currentPosition.address &&
        nextProps.position &&
        nextProps.position.address)
    ) {
      newState = {
        ...newState,
        currentPosition: nextProps.position,
      };
    }
    if (
      nextProps.stopPatterns.nearest.edges.every(stop => {
        return stop.node.place.stoptimesWithoutPatterns.length === 0;
      })
    ) {
      newState = {
        ...newState,
        fetchMoreStops: true,
      };
    }
    return newState;
  };

  componentDidUpdate({ relay, currentTime, position }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      const variables = {
        startTime: currentTime,
      };
      relay.refetchConnection(this.state.stopCount, () => {}, variables);
    }
    if (position && this.state.currentPosition) {
      if (position.address !== this.props.position.address) {
        this.updatePosition();
      }
    }
    if (this.state.fetchMoreStops) {
      this.showMore();
    }
  }

  updatePosition = () => {
    const variables = {
      lat: this.props.position.lat,
      lon: this.props.position.lon,
      startTime: this.props.currentTime,
    };
    this.props.relay.refetchConnection(
      this.state.stopCount,
      () => {},
      variables,
    );
  };

  showMore = () => {
    if (!this.props.relay.hasMore() || this.props.relay.isLoading()) {
      return;
    }
    this.state.stopCount += 5;
    this.props.relay.loadMore(5, () => {});
  };

  createNearbyStops = () => {
    const stopPatterns = this.props.stopPatterns.nearest.edges;
    const terminalNames = [];
    const isCityBikeView = this.props.match.params.mode === 'CITYBIKE';
    const sortedPatterns = isCityBikeView
      ? stopPatterns
          .slice()
          .sort(sortNearbyRentalStations(this.props.favouriteIds))
      : stopPatterns.slice().sort(sortNearbyStops(this.props.favouriteIds));
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

const connectedContainer = connectToStores(
  StopsNearYouContainerWithBreakpoint,
  ['TimeStore', 'FavouriteStore'],
  ({ getStore }, { match }) => {
    const favouriteIds =
      match.params.mode === 'CITYBIKE'
        ? new Set(
            getStore('FavouriteStore')
              .getBikeRentalStations()
              .map(station => station.stationId),
          )
        : new Set(
            getStore('FavouriteStore')
              .getStopsAndStations()
              .map(stop => stop.gtfsId),
          );
    return {
      currentTime: getStore('TimeStore').getCurrentTime().unix(),
      favouriteIds,
    };
  },
);

const refetchContainer = createPaginationContainer(
  connectedContainer,
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
        after: { type: "String" }
        maxResults: { type: "Int" }
        maxDistance: { type: "Int" }
      ) {
        nearest(
          lat: $lat
          lon: $lon
          filterByPlaceTypes: $filterByPlaceTypes
          filterByModes: $filterByModes
          first: $first
          after: $after
          maxResults: $maxResults
          maxDistance: $maxDistance
        ) @connection(key: "StopsNearYouContainer_nearest") {
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
                      stop {
                        platformCode
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
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.stopPatterns && props.stopPatterns.nearest;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(props, pagevars, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: pagevars.count,
        after: pagevars.cursor,
      };
    },
    query: graphql`
      query StopsNearYouContainerRefetchQuery(
        $lat: Float!
        $lon: Float!
        $filterByPlaceTypes: [FilterPlaceType]
        $filterByModes: [Mode]
        $first: Int!
        $after: String
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
            after: $after
            maxResults: $maxResults
            maxDistance: $maxDistance
          )
        }
      }
    `,
  },
);

export { refetchContainer as default, StopsNearYouContainer as Component };
