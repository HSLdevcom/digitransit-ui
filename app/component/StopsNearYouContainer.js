import PropTypes from 'prop-types';
import React from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
import { intlShape, FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { matchShape } from 'found';
import StopNearYou from './StopNearYou';
import withBreakpoint from '../util/withBreakpoint';
import { sortNearbyRentalStations, sortNearbyStops } from '../util/sortUtils';
import CityBikeStopNearYou from './CityBikeStopNearYou';
import Loading from './Loading';
import Icon from './Icon';

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
    withSeparator: PropTypes.bool,
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
    this.resultsUpdatedAlertRef = React.createRef();
    this.state = {
      stopCount: 5,
      currentPosition: props.position,
      fetchMoreStops: false,
      isLoadingmoreStops: false,
      isUpdatingPosition: false,
    };
  }

  static getDerivedStateFromProps = (nextProps, prevState) => {
    let newState = null;
    const terminals = [];
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
    const checkStops = (t, n) => {
      return n.every(stop => {
        return (
          stop.node.place.parentStation &&
          t.indexOf(stop.node.place.parentStation.name) !== -1
        );
      });
    };
    if (nextProps.stopPatterns) {
      const stopsForFiltering = [...nextProps.stopPatterns.nearest.edges];
      const newestStops = stopsForFiltering.splice(
        stopsForFiltering.length - 5,
      );
      stopsForFiltering.forEach(stop => {
        const node = stop.node.place;
        if (
          node.parentStation &&
          terminals.indexOf(node.parentStation.name) === -1
        ) {
          terminals.push(node.parentStation.name);
        }
      });
      if (
        newestStops.every(stop => {
          return (
            stop.node.place.stoptimesWithoutPatterns &&
            stop.node.place.stoptimesWithoutPatterns.length === 0
          );
        }) ||
        checkStops(terminals, newestStops)
      ) {
        newState = {
          ...newState,
          fetchMoreStops: true,
        };
      }
    }
    return newState;
  };

  componentDidUpdate(prevProps) {
    const {
      relay,
      currentTime,
      position,
      stopPatterns: prevStopPatterns,
    } = prevProps;
    const { currentTime: currUnix, stopPatterns } = this.props;
    if (currUnix !== currentTime) {
      const variables = {
        startTime: currentTime,
        lat: this.props.position.lat,
        lon: this.props.position.lon,
      };
      relay.refetchConnection(this.state.stopCount, null, variables);
    }
    if (position && this.state.currentPosition) {
      if (
        position.lat !== this.props.position.lat ||
        position.lon !== this.props.position.lon
      ) {
        this.updatePosition();
      }
    }
    if (this.state.fetchMoreStops) {
      this.showMore();
    }
    if (
      (this.resultsUpdatedAlertRef.current &&
        stopPatterns &&
        stopPatterns.nearest &&
        prevStopPatterns &&
        prevStopPatterns.nearest &&
        prevStopPatterns.nearest.edges.length <
          stopPatterns.nearest.edges.length) ||
      (this.state.currentPosition.lat === this.props.position.lat &&
        prevProps.position.lat !== this.state.currentPosition.lat)
    ) {
      // eslint-disable-next-line no-self-assign
      this.resultsUpdatedAlertRef.current.innerHTML = this.resultsUpdatedAlertRef.current.innerHTML;
    }
  }

  componentDidMount() {
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
    this.setState({
      isUpdatingPosition: true,
    });
    this.props.relay.refetchConnection(
      this.state.stopCount,
      () => {
        this.setState({
          isUpdatingPosition: false,
          currentPosition: this.props.position,
        });
      },
      variables,
    );
  };

  showMore = () => {
    if (!this.props.relay.hasMore() || this.state.isLoadingmoreStops) {
      return;
    }
    this.setState({ isLoadingmoreStops: true, fetchMoreStops: false });
    this.props.relay.loadMore(5, () => {
      this.setState(previousState => ({
        stopCount: previousState.stopCount + 5,
        fetchMoreStops: false,
        isLoadingmoreStops: false,
      }));
    });
  };

  createNearbyStops = () => {
    if (!this.props.stopPatterns || !this.props.stopPatterns.nearest) {
      return null;
    }
    const { mode } = this.props.match.params;
    const walkRoutingThreshold =
      mode === 'RAIL' || mode === 'SUBWAY' || mode === 'FERRY' ? 3000 : 1500;
    const stopPatterns = this.props.stopPatterns.nearest.edges;
    const terminalNames = [];
    const isCityBikeView = this.props.match.params.mode === 'CITYBIKE';
    const sortedPatterns = isCityBikeView
      ? stopPatterns
          .slice(0, 5)
          .sort(sortNearbyRentalStations(this.props.favouriteIds))
      : stopPatterns
          .slice(0, 5)
          .sort(sortNearbyStops(this.props.favouriteIds, walkRoutingThreshold));
    sortedPatterns.push(...stopPatterns.slice(5));
    const stops = sortedPatterns.map(({ node }) => {
      const stop = node.place;
      /* eslint-disable-next-line no-underscore-dangle */
      switch (stop.__typename) {
        case 'Stop':
          if (
            stop.stoptimesWithoutPatterns &&
            stop.stoptimesWithoutPatterns.length > 0
          ) {
            if (stop.parentStation) {
              if (terminalNames.indexOf(stop.parentStation.name) === -1) {
                terminalNames.push(stop.parentStation.name);
                return (
                  <StopNearYou
                    key={`${stop.gtfsId}`}
                    stop={stop}
                    currentTime={this.props.currentTime}
                  />
                );
              }
            } else {
              return (
                <StopNearYou
                  key={`${stop.gtfsId}`}
                  stop={stop}
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
    const screenReaderUpdateAlert = (
      <span className="sr-only" role="alert" ref={this.resultsUpdatedAlertRef}>
        <FormattedMessage
          id="stop-near-you-update-alert"
          defaultMessage="Search results updated"
        />
      </span>
    );
    const stops = this.createNearbyStops().filter(e => e);
    return (
      <>
        {!this.props.relay.hasMore() && !stops.length && (
          <>
            {this.props.withSeparator && <div className="separator" />}
            <div className="stops-near-you-no-stops">
              <Icon
                img="icon-icon_info"
                color={this.context.config.colors.primary}
              />
              <FormattedMessage id="nearest-no-stops" />
            </div>
          </>
        )}
        {screenReaderUpdateAlert}
        {this.state.isUpdatingPosition && (
          <div className="stops-near-you-spinner-container">
            <Loading />
          </div>
        )}
        <div role="list" className="stops-near-you-container">
          {stops}
        </div>
        {this.state.isLoadingmoreStops && (
          <div className="stops-near-you-spinner-container">
            <Loading />
          </div>
        )}
        {this.props.relay.hasMore() && (
          <button
            type="button"
            aria-label={this.context.intl.formatMessage({
              id: 'show-more-stops-near-you',
              defaultMessage: 'Load more nearby stops',
            })}
            className="show-more-button"
            onClick={this.showMore}
          >
            <FormattedMessage id="show-more" defaultMessage="Show more" />
          </button>
        )}
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
                  capacity
                  networks
                  state
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
                      tripHeadsign
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
