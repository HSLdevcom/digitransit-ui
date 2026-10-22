/* eslint-disable no-underscore-dangle */
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useRealTimeInformation } from '../../hooks/RealTimeInformationContext';
import { patternShape, errorShape } from '../../../utils/client/shapes';
import MapWithTracking from './MapWithTracking';
import RouteLine from './route/RouteLine';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import { getStartTime } from '../../../utils/client/timeUtils';
import withBreakpoint from '../../hooks/withBreakpoint';
import BackButton from '../BackButton';
import { isActiveDate } from '../../../utils/client/patternUtils';
import { boundWithMinimumArea } from '../../../utils/client/geo-utils';
import { getMapLayerOptions } from '../../../utils/client/mapLayerUtils';
import CookieSettingsButton from '../CookieSettingsButton';
import { splitGtfsId } from '../../../utils/shared/gtfs';
import { useConfigContext } from '../../client/ConfigContext';
import { useMapLayers } from '../../hooks/MapLayerContext';

const mapLayerOptions = getMapLayerOptions({
  lockedMapLayers: [
    'vehicles',
    'stop',
    'citybike',
    'scooter',
    'parkAndRideForBikes',
    'parkAndRide',
  ],
  selectedMapLayers: ['vehicles'],
});

function RoutePageMap({ pattern, lat, lon, breakpoint, trip, error, ...rest }) {
  const config = useConfigContext();
  const { mapLayers: baseMapLayers } = useMapLayers({
    notThese: [
      'stop',
      'citybike',
      'vehicles',
      'scooter',
      'parkAndRide',
      'parkAndRideForBikes',
    ],
  });
  const tripId = trip?.gtfsId;
  const [trackVehicle, setTrackVehicle] = useState(!!tripId);
  const tripIdRef = useRef();
  const mwtRef = useRef();
  const latRef = useRef();
  const lonRef = useRef();
  const bounds = useRef();
  const code = useRef();

  useEffect(() => {
    // Throw error in client side if relay fails to fetch data
    if (error && !pattern) {
      throw error.message;
    }
  }, []);

  useEffect(() => {
    if (tripId !== tripIdRef.current) {
      setTrackVehicle(!!tripId);
      mwtRef.current?.disableMapTracking();
    }
  }, [tripId]);

  useEffect(() => {
    if (pattern?.code !== code.current) {
      mwtRef.current?.disableMapTracking();
    }
  }, [pattern?.code]);

  const setMWTRef = ref => {
    mwtRef.current = ref;
  };

  const stopTracking = () => {
    // filter events which occur when map moves by changed props
    if (tripIdRef.current === tripId) {
      // user wants to navigate, allow it
      setTrackVehicle(false);
    }
  };

  const { entityId: routeId } = splitGtfsId(rest.match.params.routeId);
  const flexAgencies = useMemo(
    () =>
      [...config.flex.internal.agencies, ...config.flex.external.agencies].map(
        agency => splitGtfsId(agency).feedId,
      ),
    [config.flex.internal.agencies, config.flex.external.agencies],
  );
  const isFlexRoute = flexAgencies.includes(routeId);

  const mapLayers = isFlexRoute
    ? { ...baseMapLayers, areaStop: { routeGtfsId: routeId } }
    : baseMapLayers;

  if (!pattern) {
    return null;
  }

  const mwtProps = {};
  if (tripId && lat && lon) {
    // already getting vehicle pos
    if (trackVehicle) {
      mwtProps.lat = lat;
      mwtProps.lon = lon;
      latRef.current = lat;
      lonRef.current = lon;
      if (tripIdRef.current !== tripId) {
        setTimeout(() => {
          tripIdRef.current = tripId;
        }, 500);
      }
    } else {
      mwtProps.lat = latRef.current;
      mwtProps.lon = lonRef.current;
    }
    mwtProps.zoom = 16;
  } else {
    const maxZoomForBounds = isFlexRoute ? 12 : 18;

    if (code.current !== pattern.code || !bounds.current) {
      let filteredPoints;
      if (pattern.geometry) {
        filteredPoints = pattern.geometry.filter(
          point => point.lat !== null && point.lon !== null,
        );
      }
      bounds.current = boundWithMinimumArea(
        (filteredPoints || pattern.stops).map(p => [p.lat, p.lon]),
        maxZoomForBounds,
      );
      code.current = pattern.code;
    }
    if (tripIdRef.current) {
      // changed back to route view, force update
      mwtRef.current?.forceRefresh();
      tripIdRef.current = undefined;
    }
    mwtProps.bounds = bounds.current;
  }
  const tripSelected = lat && lon && trip?.gtfsId && isActiveDate(pattern);
  const leafletObjs = [
    <RouteLine
      key="line"
      pattern={pattern}
      vehiclePosition={tripSelected ? { lat, lon } : null}
    />,
  ];
  if (isActiveDate(pattern)) {
    leafletObjs.push(
      <VehicleMarkerContainer
        key="vehicles"
        direction={pattern.directionId}
        pattern={pattern.code}
        headsign={pattern.headsign}
        topics={[pattern.route]}
      />,
    );
  }
  /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  return (
    <MapWithTracking
      {...mwtProps}
      className="full"
      leafletObjs={leafletObjs}
      onStartNavigation={stopTracking}
      onMapTracking={stopTracking}
      setMWTRef={setMWTRef}
      {...rest}
      mapLayers={mapLayers}
      mapLayerOptions={mapLayerOptions}
    >
      {breakpoint !== 'large' && (
        <BackButton
          icon="icon_arrow-collapse--left"
          iconClassName="arrow-icon"
        />
      )}
      {config.useCookiesPrompt && <CookieSettingsButton />}
    </MapWithTracking>
  );
}

RoutePageMap.propTypes = {
  pattern: patternShape.isRequired,
  lat: PropTypes.number,
  lon: PropTypes.number,
  breakpoint: PropTypes.string.isRequired,
  trip: PropTypes.shape({ gtfsId: PropTypes.string }),
  error: errorShape,
};

const RoutePageMapWithBreakpoint = withBreakpoint(RoutePageMap);

function RoutePageMapWithVehicles(props) {
  const { vehicles } = useRealTimeInformation();
  const { trip } = props;
  let selectedVehicle;

  if (trip) {
    const tripStart = getStartTime(trip.stoptimesForDate[0].scheduledDeparture);
    selectedVehicle = Object.values(vehicles).find(
      vehicle =>
        (vehicle.tripStartTime === undefined ||
          vehicle.tripStartTime === tripStart) &&
        (vehicle.tripId === undefined || vehicle.tripId === trip.gtfsId) &&
        (vehicle.direction === undefined ||
          vehicle.direction === Number(trip.directionId)),
    );
  }

  return (
    <RoutePageMapWithBreakpoint
      {...props}
      lat={selectedVehicle?.lat}
      lon={selectedVehicle?.long}
    />
  );
}

RoutePageMapWithVehicles.propTypes = {
  trip: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
    directionId: PropTypes.string,
    stoptimesForDate: PropTypes.arrayOf(
      PropTypes.shape({
        scheduledDeparture: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }),
};

export default createFragmentContainer(RoutePageMapWithVehicles, {
  pattern: graphql`
    fragment RoutePageMap_pattern on Pattern {
      code
      directionId
      headsign
      route {
        type
        mode
        shortName
      }
      geometry {
        lat
        lon
      }
      stops {
        lat
        lon
        name
        gtfsId
        ...StopCardHeaderContainer_stop
      }
      activeDates: trips {
        day: activeDates
      }
      ...RouteLine_pattern
    }
  `,
  trip: graphql`
    fragment RoutePageMap_trip on Trip {
      stoptimesForDate {
        scheduledDeparture
      }
      isReplacement
      gtfsId
      directionId
    }
  `,
});
