import PropTypes from 'prop-types';
import React, { useEffect, useContext, useState, useRef } from 'react';
import { connectToStores } from 'fluxible-addons-react';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { fetchQuery } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import { useMatch } from 'found';
import { locationShape } from '../../../utils/client/shapes';
import { getSettings } from '../../../utils/client/planParamUtil';
import PositionStore from '../../store/PositionStore';
import { useMapLayers } from '../../hooks/MapLayerContext';
import MapWithTracking from './MapWithTracking';
import SelectedStopPopup from './popups/SelectedStopPopup';
import SelectedStopPopupContent from '../SelectedStopPopupContent';
import withBreakpoint from '../../../utils/client/withBreakpoint';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import BackButton from '../BackButton';
import ItineraryLine from './ItineraryLine';
import Loading from '../Loading';
import { getMapLayerOptions } from '../../../utils/client/mapLayerUtils';
import MapRoutingButton from '../MapRoutingButton';
import CookieSettingsButton from '../CookieSettingsButton';
import { PREFIX_CARPARK, PREFIX_BIKEPARK } from '../../../utils/shared/path';
import { streetQuery } from './StreetQuery';
import { useConfigContext } from '../../client/ConfigContext';

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

function StopPageMap(props) {
  const { stop, breakpoint, locationState, stopName } = props;
  const config = useConfigContext();
  // if the stop is not a gtfs transit stop, disable vehicles
  const shouldShowVehicles = config.showVehiclesOnStopPage && stop.gtfsId;
  const mapLayerOverrides = shouldShowVehicles
    ? { notThese: ['vehicles'] }
    : {};
  if (props.citybike) {
    mapLayerOverrides.force = ['citybike'];
  } else if (props.scooter) {
    mapLayerOverrides.force = ['scooter'];
  } else {
    mapLayerOverrides.force = ['terminal'];
  }
  const { mapLayers } = useMapLayers(mapLayerOverrides);
  const mode = stop ? getModeFromProps(props) : 'stop';
  const mapLayerOptions = getMapLayerOptions({
    lockedMapLayers: ['vehicles', mode],
    selectedMapLayers: [shouldShowVehicles && 'vehicles', mode],
  });
  const match = useMatch();

  const maxShowRouteDistance = breakpoint === 'large' ? 900 : 470;
  const { environment } = useContext(ReactRelayContext);
  const [walk, setWalk] = useState(null);
  const [bounds, setBounds] = useState(null);
  const isRouting = useRef(false);

  useEffect(() => {
    const fetchWalk = async targetStop => {
      if (locationState.hasLocation) {
        if (distance(locationState, stop) < maxShowRouteDistance) {
          const settings = getSettings(config);
          let location = {
            coordinate: {
              latitude: targetStop.lat,
              longitude: targetStop.lon,
            },
          };
          if (targetStop.gtfsId) {
            location = {
              stopLocation: { stopLocationId: targetStop.gtfsId },
            };
          }
          const variables = {
            mode: 'WALK',
            origin: {
              location: {
                coordinate: {
                  latitude: locationState.lat,
                  longitude: locationState.lon,
                },
              },
            },
            destination: {
              location,
            },
            walkSpeed: settings.walkSpeed,
            wheelchair: !!settings.accessibilityOption,
          };
          fetchQuery(environment, streetQuery, variables)
            .toPromise()
            .then(result => {
              setWalk(
                result.plan.edges.length ? result.plan.edges?.[0].node : null,
              );
            });
        }
      }
    };
    if (!walk && stop && locationState.hasLocation && !isRouting.current) {
      isRouting.current = true;
      fetchWalk(stop);
    }
    if (
      stop &&
      locationState.lat &&
      locationState.lon &&
      distance(locationState, stop) < maxShowRouteDistance
    ) {
      setBounds([
        [locationState.lat, locationState.lon],
        [
          stop.lat + (stop.lat - locationState.lat),
          stop.lon + (stop.lon - locationState.lon),
        ],
      ]);
    }
  }, [stop, locationState.status]);

  if (!stop) {
    return false;
  }

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
    children.push(<BackButton key="stop-page-back-button" />);
  }

  if (walk) {
    leafletObjs.push(
      <ItineraryLine
        key="walk"
        legs={walk.legs}
        passive={false}
        showIntermediateStops={false}
        streetMode="walk"
      />,
    );
  }
  const id = match.params.stopId || match.params.terminalId || match.params.id;

  const mwtProps = { zoom: 18 };
  if (bounds) {
    mwtProps.bounds = bounds;
  } else {
    mwtProps.lat = stop.lat;
    mwtProps.lon = stop.lon;
  }

  return (
    <MapWithTracking
      className="flex-grow"
      highlightedStops={[id]}
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

StopPageMap.propTypes = {
  stop: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    platformCode: PropTypes.string,
    gtfsId: PropTypes.string,
  }),
  breakpoint: PropTypes.string.isRequired,
  locationState: locationShape.isRequired,
  citybike: PropTypes.bool,
  parkType: PropTypes.string,
  scooter: PropTypes.bool,
  stopName: PropTypes.node,
};

const componentWithBreakpoint = withBreakpoint(StopPageMap);

const StopPageMapWithStores = connectToStores(
  componentWithBreakpoint,
  [PositionStore],
  ({ getStore }) => ({
    locationState: getStore(PositionStore).getLocationState(),
  }),
);

export {
  StopPageMapWithStores as default,
  componentWithBreakpoint as Component,
};
