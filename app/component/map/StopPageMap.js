import PropTypes from 'prop-types';
import React, { useEffect, useContext, useState } from 'react';
import { matchShape, routerShape } from 'found';
import moment from 'moment';
import { connectToStores } from 'fluxible-addons-react';

import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { graphql, fetchQuery } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import TimeStore from '../../store/TimeStore';
import PositionStore from '../../store/PositionStore';
import MapLayerStore, { mapLayerShape } from '../../store/MapLayerStore';
import MapWithTracking from './MapWithTracking';
import SelectedStopPopup from './popups/SelectedStopPopup';
import SelectedStopPopupContent from '../SelectedStopPopupContent';
import { dtLocationShape, mapLayerOptionsShape } from '../../util/shapes';
import withBreakpoint from '../../util/withBreakpoint';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import BackButton from '../BackButton';
import { addressToItinerarySearch } from '../../util/otpStrings';
import ItineraryLine from './ItineraryLine';
import Loading from '../Loading';
import { getMapLayerOptions } from '../../util/mapLayerUtils';
import MapRoutingButton from '../mapRoutingButton';

const StopPageMap = (
  { stop, breakpoint, currentTime, locationState, mapLayers, mapLayerOptions },
  { config, match },
) => {
  if (!stop) {
    return false;
  }

  const maxShowRouteDistance = breakpoint === 'large' ? 900 : 470;
  const { environment } = useContext(ReactRelayContext);
  const [plan, setPlan] = useState({ plan: {}, isFetching: false });

  useEffect(() => {
    let isMounted = true;
    const fetchPlan = async targetStop => {
      if (locationState.hasLocation && locationState.address) {
        if (distance(locationState, stop) < maxShowRouteDistance) {
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
          fetchQuery(environment, query, variables).then(({ plan: result }) => {
            if (isMounted) {
              setPlan({ plan: result, isFetching: false });
            }
          });
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
  }, [locationState.status]);
  if (locationState.loadingPosition) {
    return <Loading />;
  }

  const leafletObjs = [];
  const children = [];
  if (config.showVehiclesOnStopPage) {
    leafletObjs.push(<VehicleMarkerContainer key="vehicles" useLargeIcon />);
  }

  if (breakpoint === 'large') {
    leafletObjs.push(
      <SelectedStopPopup lat={stop.lat} lon={stop.lon} key="SelectedStopPopup">
        <SelectedStopPopupContent stop={stop} />
      </SelectedStopPopup>,
    );
  } else {
    children.push(
      <BackButton
        icon="icon-icon_arrow-collapse--left"
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
  const id = match.params.stopId || match.params.terminalId || match.params.id;

  const mwtProps = {};
  if (
    locationState &&
    locationState.lat &&
    locationState.lon &&
    stop.lat &&
    stop.lon &&
    distance(locationState, stop) < maxShowRouteDistance
  ) {
    mwtProps.bounds = [
      [locationState.lat, locationState.lon],
      [
        stop.lat + (stop.lat - locationState.lat),
        stop.lon + (stop.lon - locationState.lon),
      ],
    ];
  } else {
    mwtProps.lat = stop.lat;
    mwtProps.lon = stop.lon;
    mwtProps.zoom = !match.params.stopId || stop.platformCode ? 18 : 16;
  }

  let topButtons = [];
  if (config.showMapRoutingButton) {
    topButtons = <MapRoutingButton stop={stop} />;
  }
  return (
    <MapWithTracking
      className="flex-grow"
      hilightedStops={[id]}
      leafletObjs={leafletObjs}
      {...mwtProps}
      mapLayers={mapLayers}
      mapLayerOptions={mapLayerOptions}
      topButtons={topButtons}
    >
      {children}
    </MapWithTracking>
  );
};

StopPageMap.contextTypes = {
  config: PropTypes.object.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  getStore: PropTypes.func.isRequired,
};

StopPageMap.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
  }),
  breakpoint: PropTypes.string.isRequired,
  locationState: dtLocationShape,
  currentTime: PropTypes.number.isRequired,
  mapLayers: mapLayerShape.isRequired,
  mapLayerOptions: mapLayerOptionsShape.isRequired,
};

StopPageMap.defaultProps = {
  stop: undefined,
};

const componentWithBreakpoint = withBreakpoint(StopPageMap);

const StopPageMapWithStores = connectToStores(
  componentWithBreakpoint,
  [TimeStore, PositionStore, MapLayerStore],
  ({ config, getStore }, props) => {
    const currentTime = getStore(TimeStore).getCurrentTime().unix();
    const locationState = getStore(PositionStore).getLocationState();
    const ml = config.showVehiclesOnStopPage ? { notThese: ['vehicles'] } : {};
    if (props.citybike) {
      ml.force = ['citybike']; // show always
    } else {
      ml.force = ['terminal'];
    }
    const mapLayers = getStore(MapLayerStore).getMapLayers(ml);
    const mode = props.citybike
      ? 'citybike'
      : (props.stop.vehicleMode && props.stop.vehicleMode.toLowerCase()) ||
        'stop';
    const mapLayerOptions = getMapLayerOptions({
      lockedMapLayers: ['vehicles', mode],
      selectedMapLayers: ['vehicles', mode],
    });
    return {
      locationState,
      currentTime,
      mapLayers,
      mapLayerOptions,
    };
  },
  {
    config: PropTypes.object,
  },
);

export {
  StopPageMapWithStores as default,
  componentWithBreakpoint as Component,
};
