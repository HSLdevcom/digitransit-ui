import PropTypes from 'prop-types';
import React, { useEffect, useContext, useState } from 'react';
import cx from 'classnames';
import { matchShape, routerShape } from 'found';
import moment from 'moment';
import { connectToStores } from 'fluxible-addons-react';

import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { graphql, fetchQuery } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import TimeStore from '../store/TimeStore';
import OriginStore from '../store/OriginStore';
import DestinationStore from '../store/DestinationStore';
import PositionStore from '../store/PositionStore';
import MapContainer from './map/MapContainer';
import MapWithTracking from './map/MapWithTracking';
import SelectedStopPopup from './map/popups/SelectedStopPopup';
import SelectedStopPopupContent from './SelectedStopPopupContent';
import { dtLocationShape } from '../util/shapes';
import Icon from './Icon';
import withBreakpoint from '../util/withBreakpoint';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import BackButton from './BackButton';
import { startLocationWatch } from '../action/PositionActions';
import { addressToItinerarySearch } from '../util/otpStrings';
import ItineraryLine from './map/ItineraryLine';
import Loading from './Loading';

const toggleFullscreenMap = (fullscreenMap, location, router) => {
  addAnalyticsEvent({
    action: fullscreenMap ? 'MinimizeMapOnMobile' : 'MaximizeMapOnMobile',
    category: 'Map',
    name: 'StopPage',
  });
  if (fullscreenMap) {
    router.go(-1);
    return;
  }
  router.push({
    ...location,
    state: { ...location.state, fullscreenMap: true },
  });
};

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
const fullscreenMapOverlay = (fullscreenMap, location, router) =>
  !fullscreenMap && (
    <div
      className="map-click-prevent-overlay"
      key="overlay"
      onClick={() => {
        toggleFullscreenMap(fullscreenMap, location, router);
      }}
    />
  );

const fullscreenMapToggle = (fullscreenMap, location, router) => (
  <div
    className={cx('fullscreen-toggle', 'stopPage', {
      expanded: fullscreenMap,
    })}
    key="fullscreen-toggle"
    onClick={() => {
      toggleFullscreenMap(fullscreenMap, location, router);
    }}
  >
    {fullscreenMap ? (
      <Icon img="icon-icon_minimize" className="cursor-pointer" />
    ) : (
      <Icon img="icon-icon_maximize" className="cursor-pointer" />
    )}
  </div>
);
/* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

const StopPageMap = (
  { stop, breakpoint, origin, currentTime, destination, locationState },
  { config, match, router, executeAction },
) => {
  executeAction(startLocationWatch);
  if (!stop) {
    return false;
  }
  const { environment } = useContext(ReactRelayContext);
  const [plan, setPlan] = useState({ plan: {}, isFetching: false });

  useEffect(
    () => {
      let isMounted = true;
      const fetchPlan = async targetStop => {
        if (locationState.hasLocation && locationState.address) {
          const dist = distance(locationState, {
            lat: stop.lat,
            lon: stop.lon,
          });
          if (dist < config.suggestWalkMaxDistance) {
            const toPlace = {
              address: targetStop.name ? targetStop.name : 'stop',
              lon: targetStop.lon,
              lat: targetStop.lat,
            };
            const variables = {
              fromPlace: addressToItinerarySearch(locationState),
              toPlace: addressToItinerarySearch(toPlace),
              date: moment(currentTime * 1000).format('YYYY-MM-DD'),
              time: moment(currentTime * 1000).format('HH:mm:ss'),
            };
            const query = graphql`
              query StopPageMapQuery(
                $fromPlace: String!
                $toPlace: String!
                $date: String!
                $time: String!
              ) {
                plan: plan(
                  fromPlace: $fromPlace
                  toPlace: $toPlace
                  date: $date
                  time: $time
                  transportModes: [{ mode: WALK }]
                ) {
                  itineraries {
                    legs {
                      mode
                      ...ItineraryLine_legs
                    }
                  }
                }
              }
            `;
            fetchQuery(environment, query, variables).then(
              ({ plan: result }) => {
                if (isMounted) {
                  setPlan({ plan: result, isFetching: false });
                }
              },
            );
          }
        }
      };
      if (stop && locationState.hasLocation) {
        setPlan({ plan: plan.plan, isFetching: true });
        fetchPlan(stop);
      }
      return () => {
        isMounted = false;
      };
    },
    [locationState.status],
  );
  if (locationState.loadingPosition) {
    return <Loading />;
  }

  const fullscreenMap =
    match.location.state && match.location.state.fullscreenMap === true;
  const leafletObjs = [];
  const children = [];
  if (config.showVehiclesOnStopPage) {
    leafletObjs.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon ignoreMode />,
    );
  }

  if (breakpoint === 'large') {
    leafletObjs.push(
      <SelectedStopPopup lat={stop.lat} lon={stop.lon} key="SelectedStopPopup">
        <SelectedStopPopupContent stop={stop} />
      </SelectedStopPopup>,
    );
  } else {
    children.push(fullscreenMapOverlay(fullscreenMap, match.location, router));
    children.push(fullscreenMapToggle(fullscreenMap, match.location, router));
    children.push(
      <BackButton
        icon="icon-icon_arrow-collapse--left"
        color={config.colors.primary}
        iconClassName="arrow-icon"
        key="stop-page-back-button"
      />,
    );
  }

  if (plan.plan.itineraries) {
    leafletObjs.push(
      ...plan.plan.itineraries.map((itinerary, i) => (
        <ItineraryLine
          key="itinerary"
          hash={i}
          legs={itinerary.legs}
          passive={false}
          showIntermediateStops={false}
          streetMode="walk"
        />
      )),
    );
  }

  const showScale = fullscreenMap || breakpoint === 'large';

  const id = match.params.stopId || match.params.terminalId;

  let bounds = [];
  if (
    locationState &&
    locationState.lat &&
    locationState.lon &&
    stop.lat &&
    stop.lon
  ) {
    bounds = [[locationState.lat, locationState.lon], [stop.lat, stop.lon]];
  }

  if (locationState.hasLocation && plan.plan.itineraries) {
    return (
      <MapWithTracking
        className="full"
        lat={stop.lat}
        lon={stop.lon}
        zoom={!match.params.stopId || stop.platformCode ? 18 : 16}
        showStops
        hilightedStops={[id]}
        leafletObjs={leafletObjs}
        showScaleBar={showScale}
        setInitialZoom={17}
        origin={origin}
        destination={destination}
        setInitialMapTracking
        bounds={bounds}
        fitBounds
      >
        {children}
      </MapWithTracking>
    );
  }
  return (
    <MapContainer
      className="full"
      lat={stop.lat}
      lon={stop.lon}
      zoom={!match.params.stopId || stop.platformCode ? 18 : 16}
      showStops
      hilightedStops={[id]}
      leafletObjs={leafletObjs}
      showScaleBar={showScale}
    >
      {children}
    </MapContainer>
  );
};

StopPageMap.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
};

StopPageMap.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }),
  breakpoint: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
  locationState: dtLocationShape,
  currentTime: PropTypes.number.isRequired,
};

StopPageMap.defaultProps = {
  stop: undefined,
  origin: {},
  destination: {},
};

const componentWithBreakpoint = withBreakpoint(StopPageMap);

const StopsNearYouMapWithStores = connectToStores(
  componentWithBreakpoint,
  [OriginStore, TimeStore, DestinationStore, PositionStore],
  ({ getStore }) => {
    const currentTime = getStore(TimeStore)
      .getCurrentTime()
      .unix();
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();
    const locationState = getStore(PositionStore).getLocationState();
    return {
      origin,
      destination,
      locationState,
      currentTime,
    };
  },
);

export {
  StopsNearYouMapWithStores as default,
  componentWithBreakpoint as Component,
};
