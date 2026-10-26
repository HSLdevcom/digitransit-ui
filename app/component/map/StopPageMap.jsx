import PropTypes from 'prop-types';
import React, { useEffect, useContext, useState, useRef } from 'react';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { fetchQuery } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import { useMatch } from 'found';
import { getSettings } from '../../../utils/client/planParamUtil';
import { useMapLayers } from '../../hooks/MapLayerContext';
import { usePosition } from '../../hooks/PositionContext';
import MapWithTracking from './MapWithTracking';
import SelectedStopPopup from './popups/SelectedStopPopup';
import SelectedStopPopupContent from '../SelectedStopPopupContent';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import BackButton from '../BackButton';
import ItineraryLine from './ItineraryLine';
import Loading from '../Loading';
import { getMapLayerOptions } from '../../../utils/client/mapLayerUtils';
import MapRoutingButton from '../MapRoutingButton';
import CookieSettingsButton from '../CookieSettingsButton';
import { PREFIX_CARPARK, PREFIX_BIKEPARK } from '../../../utils/shared/path';
import { streetQuery } from './StreetQuery';
import { useConfigContext } from '../../hooks/ConfigContext';
import { useBreakpoint } from '../../../utils/client/withBreakpoint';
import { STOP_STATUS } from '../../../utils/client/stopStatusUtils';

const getMode = (stop, citybike, parkType, scooter) => {
  if (citybike) {
    return 'citybike';
  }
  if (parkType === PREFIX_BIKEPARK) {
    return 'parkAndRideForBikes';
  }
  if (parkType === PREFIX_CARPARK) {
    return 'parkAndRide';
  }
  if (stop.vehicleMode) {
    return stop.vehicleMode.toLowerCase();
  }
  if (scooter) {
    return 'scooter';
  }
  return 'stop';
};

function StopPageMap({
  stop,
  stopName,
  stopStatus = null,
  stopAlertEffects = null,
  citybike = false,
  scooter = false,
  parkType = null,
}) {
  const config = useConfigContext();
  const locationState = usePosition();
  const breakpoint = useBreakpoint();
  // if the stop is not a gtfs transit stop, disable vehicles
  const shouldShowVehicles = config.showVehiclesOnStopPage && stop.gtfsId;
  const mapLayerOverrides = shouldShowVehicles
    ? { notThese: ['vehicles'] }
    : {};
  if (citybike) {
    mapLayerOverrides.force = ['citybike'];
  } else if (scooter) {
    mapLayerOverrides.force = ['scooter'];
  } else {
    mapLayerOverrides.force = ['terminal'];
  }
  const { mapLayers } = useMapLayers(mapLayerOverrides);
  const mode = stop ? getMode(stop, citybike, parkType, scooter) : 'stop';
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
        <SelectedStopPopupContent
          stop={stop}
          name={stopName}
          status={stopStatus}
          alertEffects={stopAlertEffects}
        />
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
  citybike: PropTypes.bool,
  parkType: PropTypes.string,
  scooter: PropTypes.bool,
  stopName: PropTypes.node,
  stopStatus: PropTypes.oneOf(Object.values(STOP_STATUS)),
  stopAlertEffects: PropTypes.arrayOf(PropTypes.string),
};

export default StopPageMap;
