/* eslint-disable no-underscore-dangle */
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { configShape, patternShape, errorShape } from '../../util/shapes';
import MapWithTracking from './MapWithTracking';
import RouteLine from './route/RouteLine';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import { getStartTime } from '../../util/timeUtils';
import withBreakpoint from '../../util/withBreakpoint';
import BackButton from '../BackButton';
import { isActiveDate } from '../../util/patternUtils';
import { boundWithMinimumArea } from '../../util/geo-utils';
import { getMapLayerOptions } from '../../util/mapLayerUtils';
import CookieSettingsButton from '../CookieSettingsButton';

function RoutePageMap(
  { pattern, lat, lon, breakpoint, trip, error, ...rest },
  { config },
) {
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

  if (!pattern) {
    return null;
  }

  useEffect(() => {
    if (tripId !== tripIdRef.current) {
      setTrackVehicle(!!tripId);
      mwtRef.current?.disableMapTracking();
    }
  }, [tripId]);

  useEffect(() => {
    if (pattern.code !== code.current) {
      mwtRef.current?.disableMapTracking();
    }
  }, [pattern.code]);

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
    if (code.current !== pattern.code || !bounds.current) {
      let filteredPoints;
      if (pattern.geometry) {
        filteredPoints = pattern.geometry.filter(
          point => point.lat !== null && point.lon !== null,
        );
      }
      bounds.current = boundWithMinimumArea(
        (filteredPoints || pattern.stops).map(p => [p.lat, p.lon]),
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

RoutePageMap.defaultProps = {
  trip: null,
  lat: undefined,
  lon: undefined,
  error: undefined,
};

RoutePageMap.contextTypes = { config: configShape.isRequired };

const RoutePageMapWithVehicles = connectToStores(
  withBreakpoint(RoutePageMap),
  ['RealTimeInformationStore', 'MapLayerStore'],
  ({ getStore }, { trip }) => {
    const mapLayers = getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'citybike', 'vehicles', 'scooter'],
    });
    const mapLayerOptions = getMapLayerOptions({
      lockedMapLayers: ['vehicles', 'stop', 'citybike', 'scooter'],
      selectedMapLayers: ['vehicles'],
    });
    if (trip) {
      const { vehicles } = getStore('RealTimeInformationStore');
      const tripStart = getStartTime(
        trip.stoptimesForDate[0].scheduledDeparture,
      );
      const matchingVehicles = Object.keys(vehicles)
        .map(key => vehicles[key])
        .filter(
          v =>
            (v.tripStartTime === undefined || v.tripStartTime === tripStart) &&
            (v.tripId === undefined || v.tripId === trip.gtfsId) &&
            (v.direction === undefined ||
              v.direction === Number(trip.directionId)),
        );

      if (!matchingVehicles.length) {
        return { mapLayers, mapLayerOptions };
      }
      const selectedVehicle = matchingVehicles[0];
      return {
        lat: selectedVehicle.lat,
        lon: selectedVehicle.long,
        mapLayers,
        mapLayerOptions,
      };
    }
    return { mapLayers, mapLayerOptions };
  },
);

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
      gtfsId
      directionId
    }
  `,
});
