import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { createFragmentContainer, graphql } from 'react-relay';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Icon from './Icon';
import MapContainer from './map/MapContainer';
import RouteLine from './map/route/RouteLine';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import { getStartTime } from '../util/timeUtils';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import BackButton from './BackButton';

class RouteMapContainer extends React.PureComponent {
  static propTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    pattern: PropTypes.object.isRequired,
    lat: PropTypes.number,
    lon: PropTypes.number,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  tripId = this.props.match.params.tripId;

  dispLat = this.props.lat;

  dispLon = this.props.lon;

  render() {
    const { pattern, lat, lon, match, router, breakpoint } = this.props;
    const { config } = this.context;
    let centerToMarker = false;

    if (this.props.match.params.tripId !== this.tripId) {
      this.tripId = this.props.match.params.tripId;
      centerToMarker = true;
    }

    const fullscreen =
      match.location.state && match.location.state.fullscreenMap === true;

    [this.dispLat, this.dispLon] =
      (centerToMarker || (!this.dispLat || !this.dispLon)) &&
      (match.params.tripId || (!fullscreen && breakpoint !== 'large')) &&
      (lat && lon)
        ? [lat, lon]
        : [this.dispLat, this.dispLon];

    if (!pattern) {
      return false;
    }

    let tripStart;

    const toggleFullscreenMap = () => {
      addAnalyticsEvent({
        action: fullscreen ? 'MinimizeMapOnMobile' : 'MaximizeMapOnMobile',
        category: 'Map',
        name: 'RoutePage',
      });
      if (fullscreen) {
        router.go(-1);
        return;
      }
      router.push({
        ...match.location,
        state: { ...match.location.state, fullscreenMap: true },
      });
    };

    const leafletObjs = [
      <RouteLine key="line" pattern={pattern} />,
      <VehicleMarkerContainer
        key="vehicles"
        direction={pattern.directionId}
        pattern={pattern.code}
        headsign={pattern.headsign}
        tripStart={tripStart}
      />,
    ];

    const showScale = fullscreen || breakpoint === 'large';

    let filteredPoints;
    if (pattern.geometry) {
      filteredPoints = pattern.geometry.filter(
        point => point.lat !== null && point.lon !== null,
      );
    }
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    return (
      <MapContainer
        lat={this.dispLat}
        lon={this.dispLon}
        className="full"
        leafletObjs={leafletObjs}
        fitBounds={!match.params.tripId}
        bounds={(filteredPoints || pattern.stops).map(p => [p.lat, p.lon])}
        zoom={
          this.dispLat && this.dispLon && match.params.tripId ? 15 : undefined
        }
        showScaleBar={showScale}
      >
        {breakpoint !== 'large' &&
          !fullscreen && (
            <div
              className="map-click-prevent-overlay"
              onClick={toggleFullscreenMap}
              key="overlay"
            />
          )}
        {breakpoint !== 'large' && (
          <React.Fragment>
            <BackButton
              icon="icon-icon_arrow-collapse--left"
              iconClassName="arrow-icon"
              color={config.colors.primary}
            />
            <div
              className={cx('fullscreen-toggle', 'routePage', {
                expanded: fullscreen,
              })}
              onClick={toggleFullscreenMap}
            >
              {fullscreen ? (
                <Icon img="icon-icon_minimize" className="cursor-pointer" />
              ) : (
                <Icon img="icon-icon_maximize" className="cursor-pointer" />
              )}
            </div>
          </React.Fragment>
        )}
      </MapContainer>
    );
  }
}

const RouteMapContainerWithVehicles = connectToStores(
  withBreakpoint(RouteMapContainer),
  ['RealTimeInformationStore'],
  ({ getStore }, { trip }) => {
    if (trip) {
      const { vehicles } = getStore('RealTimeInformationStore');
      const tripStart = getStartTime(
        trip.stoptimesForDate[0].scheduledDeparture,
      );
      const matchingVehicles = Object.keys(vehicles)
        .map(key => vehicles[key])
        .filter(
          vehicle =>
            vehicle.tripStartTime === undefined ||
            vehicle.tripStartTime === tripStart,
        )
        .filter(
          vehicle =>
            vehicle.tripId === undefined || vehicle.tripId === trip.gtfsId,
        )
        .filter(
          vehicle =>
            vehicle.direction === undefined ||
            vehicle.direction === Number(trip.directionId),
        );

      if (matchingVehicles.length !== 1) {
        // no matching vehicles or cant distinguish between vehicles
        return null;
      }
      const selectedVehicle = matchingVehicles[0];

      return { lat: selectedVehicle.lat, lon: selectedVehicle.long };
    }
    return null;
  },
);

export default createFragmentContainer(RouteMapContainerWithVehicles, {
  pattern: graphql`
    fragment RouteMapContainer_pattern on Pattern {
      code
      directionId
      headsign
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
      ...RouteLine_pattern
    }
  `,
  trip: graphql`
    fragment RouteMapContainer_trip on Trip {
      stoptimesForDate {
        scheduledDeparture
      }
      gtfsId
      directionId
    }
  `,
});
