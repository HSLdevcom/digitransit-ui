import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { createPaginationContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { relayShape } from '../../util/shapes';
import StopNearYouContainer from './StopNearYouContainer';
import withBreakpoint from '../../util/withBreakpoint';
import {
  sortNearYouRentalStations,
  sortNearYouStops,
} from '../../util/sortUtils';
import VehicleRentalStationNearYou from './VehicleRentalStationNearYou';
import ParkNearYou from './ParkNearYou';
import Loading from '../Loading';
import Icon from '../Icon';
import DisruptionBanner from '../DisruptionBanner';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import { useConfigContext } from '../../configurations/ConfigContext';

function NearYouContainer({
  places,
  currentTime,
  relay,
  position,
  withSeparator,
  prioritizedStops,
  mode,
  isParentTabActive,
  favouriteIds,
}) {
  const config = useConfigContext();
  const intl = useTranslationsContext();
  const ariaRef = useRef('stop-near-you');
  const searchPos = useRef(position); // position used for fetching nearest places
  const refetches = useRef(0);
  const stopCount = useRef(5);
  const [loading, setLoading] = useState(0);

  const updatePosition = () => {
    const variables = {
      ...position,
      startTime: currentTime,
    };
    setLoading(1);
    relay.refetchConnection(
      stopCount.current,
      () => {
        setLoading(0);
        searchPos.current = position;
      },
      variables,
    );
  };

  const showMore = automatic => {
    if (!relay.hasMore() || loading) {
      return;
    }
    setLoading(2);
    if (!automatic) {
      ariaRef.current = 'loading';
    }
    relay.loadMore(5, () => {
      if (automatic) {
        refetches.current += 1;
      }
      stopCount.current += 5;
      ariaRef.current = 'stop-near-you-update-alert';
      setLoading(0);
    });
  };

  useEffect(() => {
    const { edges } = places.nearest;
    const fetchMore =
      edges.filter(
        stop => !(stop.node.place.stoptimesWithoutPatterns?.length === 0),
      ).length < 5 && refetches.current < config.maxNearYouRefetches;
    if (fetchMore) {
      showMore(true);
    }
  }, [places]);

  useEffect(() => {
    if (
      position.lat !== searchPos.current.lat ||
      position.lon !== searchPos.current.lon
    ) {
      updatePosition();
    }
  }, [position.lat, position.lon]);

  const createNearYouPlaces = () => {
    if (!places?.nearest) {
      return [];
    }
    const walkRoutingThreshold =
      mode === 'RAIL' || mode === 'SUBWAY' || mode === 'FERRY' ? 3000 : 1500;
    const { edges } = places.nearest;
    let sorted;
    if (mode === 'CITYBIKE') {
      sorted = edges.slice().sort(sortNearYouRentalStations(favouriteIds));
    } else if (mode === 'BIKEPARK' || mode === 'CARPARK') {
      sorted = edges;
    } else {
      sorted = edges
        .slice()
        .sort(sortNearYouStops(favouriteIds, walkRoutingThreshold));
    }

    const stops = sorted.map(({ node }) => {
      const { place } = node;
      /* eslint-disable-next-line no-underscore-dangle */
      switch (place.__typename) {
        case 'Stop':
          if (place.stoptimesWithoutPatterns.length > 0) {
            if (!prioritizedStops.includes(place.gtfsId)) {
              return (
                <StopNearYouContainer
                  key={`${place.gtfsId}`}
                  stop={place}
                  currentTime={currentTime}
                  isParentTabActive={isParentTabActive}
                />
              );
            }
          }
          break;
        case 'VehicleRentalStation':
          return (
            <VehicleRentalStationNearYou
              key={`${place.stationId}`}
              station={place}
              currentTime={currentTime}
              isParentTabActive={isParentTabActive}
            />
          );
        case 'VehicleParking':
          return (
            <ParkNearYou
              key={`${place.vehicleParkingId}`}
              park={place}
              currentTime={currentTime}
              isParentTabActive={isParentTabActive}
              mode={mode}
            />
          );
        default:
          return null;
      }
      return null;
    });
    return stops;
  };

  const items = createNearYouPlaces();
  const alerts = items
    .flatMap(stop => stop?.props?.stop?.routes || [])
    .flatMap(route => route?.alerts || [])
    .filter(alert => alert.alertSeverityLevel === 'SEVERE');
  const noStopsFound =
    !items.length && refetches >= config.maxNearYouRefetches && !loading;
  return (
    <>
      {alerts?.length ? <DisruptionBanner alerts={alerts} mode={mode} /> : null}
      {((!relay.hasMore() && !items.length && !prioritizedStops.length) ||
        (noStopsFound && !prioritizedStops.length)) && (
        <>
          {withSeparator && <div className="separator" />}
          <div className="near-you-no-stops">
            <Icon img="icon_info" color={config.colors.primary} />
            <FormattedMessage id="nearest-no-stops" />
          </div>
        </>
      )}
      <div role="status" className="sr-only" id="status" aria-live="polite">
        <FormattedMessage id={ariaRef.current} />
      </div>
      {loading === 1 && (
        <div key="loading1" className="near-you-spinner-container">
          <Loading />
        </div>
      )}
      <div key="items" role="list" className="near-you-container">
        {items}
      </div>
      {loading === 2 && (
        <div key="loading2" className="near-you-spinner-container">
          <Loading />
        </div>
      )}
      {relay.hasMore() && !noStopsFound && (
        <button
          type="button"
          aria-label={intl.formatMessage({
            id: 'show-more-stops-near-you',
            defaultMessage: 'Load more nearby stops',
          })}
          className="show-more-button"
          onClick={() => showMore(false)}
        >
          <FormattedMessage id="show-more" defaultMessage="Show more" />
        </button>
      )}
    </>
  );
}

NearYouContainer.propTypes = {
  // eslint-disable-next-line
  places: PropTypes.object,
  currentTime: PropTypes.number.isRequired,
  relay: relayShape.isRequired,
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }).isRequired,
  withSeparator: PropTypes.bool,
  prioritizedStops: PropTypes.arrayOf(PropTypes.string).isRequired,
  mode: PropTypes.string.isRequired,
  isParentTabActive: PropTypes.bool,
  // eslint-disable-next-line
  favouriteIds: PropTypes.object,
};

NearYouContainer.defaultProps = {
  places: undefined,
  withSeparator: false,
  isParentTabActive: false,
};

const NearYouContainerWithBreakpoint = withBreakpoint(NearYouContainer);

const refetchContainer = createPaginationContainer(
  NearYouContainerWithBreakpoint,
  {
    places: graphql`
      fragment NearYouContainer_places on QueryType
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
        filterByNetwork: { type: "[String!]", defaultValue: null }
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
          filterByNetwork: $filterByNetwork
        ) @connection(key: "NearYouContainer_nearest") {
          edges {
            node {
              distance
              place {
                __typename
                ... on VehicleRentalStation {
                  ...VehicleRentalStationNearYou_station
                  stationId
                  rentalNetwork {
                    networkId
                  }
                }
                ... on VehicleParking {
                  ...ParkNearYou_park
                  vehicleParkingId
                }
                ... on Stop {
                  ...StopNearYouContainer_stop
                    @arguments(
                      startTime: $startTime
                      omitNonPickups: $omitNonPickups
                    )
                  id
                  name
                  gtfsId
                  stoptimesWithoutPatterns(
                    startTime: $startTime
                    omitNonPickups: $omitNonPickups
                  ) {
                    scheduledArrival
                  }
                  routes {
                    ... on Route {
                      alerts {
                        feed
                        id
                        alertSeverityLevel
                        alertHeaderText
                        alertEffect
                        alertCause
                        alertDescriptionText
                        effectiveStartDate
                        effectiveEndDate
                        entities {
                          __typename
                          ... on Route {
                            mode
                            shortName
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
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.places?.nearest;
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
      query NearYouContainerRefetchQuery(
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
        $filterByNetwork: [String!]
      ) {
        viewer {
          ...NearYouContainer_places
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
              filterByNetwork: $filterByNetwork
            )
        }
      }
    `,
  },
);

export { refetchContainer as default, NearYouContainer as Component };
