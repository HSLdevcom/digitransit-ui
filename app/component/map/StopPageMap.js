import PropTypes from 'prop-types';
import React, { useEffect, useContext, useState } from 'react';
import { matchShape, routerShape } from 'found';
import moment from 'moment';
import { connectToStores } from 'fluxible-addons-react';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { graphql, fetchQuery } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import {
  configShape,
  locationShape,
  mapLayerOptionsShape,
} from '../../util/shapes';
import { getSettings } from '../../util/planParamUtil';
import TimeStore from '../../store/TimeStore';
import PositionStore from '../../store/PositionStore';
import MapLayerStore, { mapLayerShape } from '../../store/MapLayerStore';
import MapWithTracking from './MapWithTracking';
import SelectedStopPopup from './popups/SelectedStopPopup';
import SelectedStopPopupContent from '../SelectedStopPopupContent';
import withBreakpoint from '../../util/withBreakpoint';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import BackButton from '../BackButton';
import { locationToUri } from '../../util/otpStrings';
import ItineraryLine from './ItineraryLine';
import Loading from '../Loading';
import { getMapLayerOptions } from '../../util/mapLayerUtils';
import MapRoutingButton from '../MapRoutingButton';
import CookieSettingsButton from '../CookieSettingsButton';
import { PREFIX_CARPARK, PREFIX_BIKEPARK } from '../../util/path';

const getModeFromProps = props => {
  if (props.citybike) {
    return 'citybike';
  }
  if (props.parkType === PREFIX_BIKEPARK) {
    return 'parkAndRideForBikes';
  }
  if (props.parkType === PREFIX_CARPARK) {
    return 'parkAndRide';
  }
  if (props.stop.vehicleMode) {
    return props.stop.vehicleMode.toLowerCase();
  }
  if (props.scooter) {
    return 'scooter';
  }
  return 'stop';
};

function StopPageMap(
  {
    stop,
    breakpoint,
    currentTime,
    locationState,
    mapLayers,
    mapLayerOptions,
    stopName,
  },
  { config, match },
) {
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
          const settings = getSettings(config);
          const variables = {
            fromPlace: locationToUri(locationState),
            toPlace: locationToUri(toPlace),
            date: moment(currentTime * 1000).format('YYYY-MM-DD'),
            time: moment(currentTime * 1000).format('HH:mm:ss'),
            walkSpeed: settings.walkSpeed,
            wheelchair: !!settings.accessibilityOption,
          };
          const query = graphql`
            query StopPageMapQuery(
              $fromPlace: String!
              $toPlace: String!
              $date: String!
              $time: String!
              $walkSpeed: Float
              $wheelchair: Boolean
            ) {
              plan: plan(
                fromPlace: $fromPlace
                toPlace: $toPlace
                date: $date
                time: $time
                transportModes: [{ mode: WALK }]
                walkSpeed: $walkSpeed
                wheelchair: $wheelchair
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
          fetchQuery(environment, query, variables)
            .toPromise()
            .then(({ plan: result }) => {
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
        <SelectedStopPopupContent stop={stop} name={stopName} />
      </SelectedStopPopup>,
    );
    if (config.useCookiesPrompt) {
      children.push(<CookieSettingsButton key="cookiesettings" />);
    }
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

  return (
    <MapWithTracking
      className="flex-grow"
      hilightedStops={[id]}
      leafletObjs={leafletObjs}
      {...mwtProps}
      mapLayers={mapLayers}
      mapLayerOptions={mapLayerOptions}
      topButtons={<MapRoutingButton stop={stop} />}
    >
      {children}
    </MapWithTracking>
  );
}

StopPageMap.contextTypes = {
  config: configShape.isRequired,
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
  locationState: locationShape.isRequired,
  currentTime: PropTypes.number.isRequired,
  mapLayers: mapLayerShape.isRequired,
  mapLayerOptions: mapLayerOptionsShape.isRequired,
  parkType: PropTypes.string,
  stopName: PropTypes.node,
};

StopPageMap.defaultProps = {
  stop: undefined,
  parkType: undefined,
  stopName: undefined,
};

const componentWithBreakpoint = withBreakpoint(StopPageMap);

const StopPageMapWithStores = connectToStores(
  componentWithBreakpoint,
  [TimeStore, PositionStore, MapLayerStore],
  ({ config, getStore }, props) => {
    const currentTime = getStore(TimeStore).getCurrentTime();
    const locationState = getStore(PositionStore).getLocationState();
    const ml = config.showVehiclesOnStopPage ? { notThese: ['vehicles'] } : {};
    if (props.citybike) {
      ml.force = ['citybike']; // show always
    } else if (props.scooter) {
      ml.force = ['scooter']; // show always
    } else {
      ml.force = ['terminal'];
    }
    const mapLayers = getStore(MapLayerStore).getMapLayers(ml);
    const mode = getModeFromProps(props);
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
    config: configShape,
  },
);

export {
  StopPageMapWithStores as default,
  componentWithBreakpoint as Component,
};
