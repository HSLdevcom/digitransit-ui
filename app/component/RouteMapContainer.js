import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import Relay from 'react-relay/classic';
import { routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import some from 'lodash/some';

import Icon from './Icon';
import MapContainer from './map/MapContainer';
import RouteLine from './map/route/RouteLine';
import VehicleMarkerContainer from './map/VehicleMarkerContainer';
import StopCardHeaderContainer from './StopCardHeaderContainer';
import { getStartTime } from '../util/timeUtils';
import withBreakpoint from '../util/withBreakpoint';
import { addAnalyticsEvent } from '../util/analyticsUtils';

class RouteMapContainer extends React.PureComponent {
  static contextTypes = {
    router: routerShape.isRequired, // eslint-disable-line react/no-typos
    location: PropTypes.object.isRequired,
  };

  static propTypes = {
    routes: PropTypes.arrayOf(
      PropTypes.shape({
        fullscreenMap: PropTypes.bool,
      }),
    ).isRequired,
    pattern: PropTypes.object.isRequired,
    tripId: PropTypes.string,
    lat: PropTypes.number,
    lon: PropTypes.number,
    breakpoint: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      hasCentered: false,
      shouldFitBounds: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.tripId !== nextProps.tripId) {
      this.setState({
        hasCentered: false,
        shouldFitBounds: true,
      });
    }
  }

  render() {
    const { router, location } = this.context;
    const { pattern, lat, lon, routes, tripId, breakpoint } = this.props;
    const { hasCentered, shouldFitBounds } = this.state;

    const fullscreen = some(routes, route => route.fullscreenMap);

    const [dispLat, dispLon] =
      (!hasCentered && tripId) || (!fullscreen && breakpoint !== 'large')
        ? [lat, lon]
        : [undefined, undefined];

    if (!hasCentered && lat && lon) {
      this.setState({ hasCentered: true, shouldFitBounds: false });
    }
    // ,
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
        router.goBack();
        return;
      }
      router.push(`${location.pathname}/kartta`);
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
        lat={dispLat}
        lon={dispLon}
        className="full"
        leafletObjs={leafletObjs}
        fitBounds={!(dispLat && dispLon) && shouldFitBounds}
        bounds={(filteredPoints || pattern.stops).map(p => [p.lat, p.lon])}
        zoom={dispLat && dispLon ? 15 : undefined}
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
        )}
      </MapContainer>
    );
  }
}

export const RouteMapFragments = {
  pattern: () => Relay.QL`
    fragment on Pattern {
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
        ${StopCardHeaderContainer.getFragment('stop')}
      }
      ${RouteLine.getFragment('pattern')}
    }
  `,
  trip: () => Relay.QL`
    fragment on Trip {
      stoptimesForDate {
        scheduledDeparture
      }
      gtfsId
      directionId
    }
  `,
};

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
        return { lat: null, lon: null };
      }
      const selectedVehicle = matchingVehicles[0];

      return { lat: selectedVehicle.lat, lon: selectedVehicle.long };
    }
    return null;
  },
);

export default Relay.createContainer(RouteMapContainerWithVehicles, {
  fragments: RouteMapFragments,
});
